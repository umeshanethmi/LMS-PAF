package com.lms.assessment.service.campus;

import com.lms.assessment.dto.campus.BookingChatRequest;
import com.lms.assessment.dto.campus.BookingChatResponse;
import com.lms.assessment.dto.campus.BookingChatResponse.SlotSuggestion;
import com.lms.assessment.model.campus.CampusResource;
import com.lms.assessment.repository.campus.ResourceBookingRepository;
import com.lms.assessment.repository.campus.ResourceUnavailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BookingRecommendationService {

    private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private static final List<LocalTime[]> CANDIDATE_SLOTS = List.of(
            new LocalTime[]{LocalTime.of(8, 0),  LocalTime.of(10, 0)},
            new LocalTime[]{LocalTime.of(9, 0),  LocalTime.of(11, 0)},
            new LocalTime[]{LocalTime.of(10, 0), LocalTime.of(12, 0)},
            new LocalTime[]{LocalTime.of(13, 0), LocalTime.of(15, 0)},
            new LocalTime[]{LocalTime.of(14, 0), LocalTime.of(16, 0)},
            new LocalTime[]{LocalTime.of(15, 0), LocalTime.of(17, 0)},
            new LocalTime[]{LocalTime.of(16, 0), LocalTime.of(18, 0)}
    );

    private final CampusResourceService resourceService;
    private final ResourceBookingRepository bookingRepo;
    private final ResourceUnavailabilityRepository unavailRepo;

    public BookingRecommendationService(CampusResourceService resourceService,
                                        ResourceBookingRepository bookingRepo,
                                        ResourceUnavailabilityRepository unavailRepo) {
        this.resourceService = resourceService;
        this.bookingRepo = bookingRepo;
        this.unavailRepo = unavailRepo;
    }

    public BookingChatResponse recommendFromMessage(BookingChatRequest req) {
        String msg = req.getMessage().toLowerCase();

        // 1. Parse resource type
        CampusResource.ResourceType type = detectType(msg);
        String typeLabel = type == CampusResource.ResourceType.LAB ? "lab" : "lecture hall";

        // 2. Parse desired duration in hours
        int durationHours = detectDuration(msg);

        // 3. Parse preferred date
        LocalDate date = parseDate(req.getPreferredDate());

        // 4. Load all active resources of that type
        List<CampusResource> candidates = resourceService.findActiveByType(type);
        if (candidates.isEmpty()) {
            return BookingChatResponse.builder()
                    .reply("No " + typeLabel + "s are currently registered in the system. Please check back later.")
                    .suggestions(Collections.emptyList())
                    .build();
        }

        // 5. Score and collect suggestions
        List<SlotSuggestion> suggestions = new ArrayList<>();
        for (CampusResource resource : candidates) {
            List<SlotSuggestion> slots = findAvailableSlots(resource, date, durationHours);
            suggestions.addAll(slots);
        }

        // 6. Sort: prefer same-building clusters, then fewer bookings (lower score = less busy)
        suggestions.sort(Comparator
                .comparingInt((SlotSuggestion s) -> buildingOrder(s.getBuilding()))
                .thenComparingInt(s -> -s.getAvailableHours())
        );

        List<SlotSuggestion> top = suggestions.stream().limit(5).collect(Collectors.toList());

        String reply = buildReply(msg, typeLabel, durationHours, top, date);
        return BookingChatResponse.builder().reply(reply).suggestions(top).build();
    }

    // ── Intent Parsing ────────────────────────────────────────────────────────

    private CampusResource.ResourceType detectType(String msg) {
        if (msg.contains("lab") || msg.contains("computer") || msg.contains("science lab")) {
            return CampusResource.ResourceType.LAB;
        }
        return CampusResource.ResourceType.HALL;
    }

    private int detectDuration(String msg) {
        Pattern p = Pattern.compile("(\\d+)\\s*(?:hour|hr|h)");
        Matcher m = p.matcher(msg);
        if (m.find()) {
            return Math.max(1, Math.min(8, Integer.parseInt(m.group(1))));
        }
        return 2; // default 2 hours
    }

    private LocalDate parseDate(String preferredDate) {
        if (preferredDate != null && !preferredDate.isBlank()) {
            try {
                return LocalDate.parse(preferredDate);
            } catch (Exception ignored) {}
        }
        return LocalDate.now().plusDays(1);
    }

    // ── Availability Scanning ─────────────────────────────────────────────────

    private List<SlotSuggestion> findAvailableSlots(CampusResource resource, LocalDate date, int durationHours) {
        List<SlotSuggestion> results = new ArrayList<>();
        for (LocalTime[] window : CANDIDATE_SLOTS) {
            LocalDateTime start = LocalDateTime.of(date, window[0]);
            LocalDateTime end = start.plusHours(durationHours);

            // Check end within reasonable campus hours
            if (end.getHour() > 21) continue;

            boolean conflictsBooking = !bookingRepo.findOverlapping(resource.getId(), start, end).isEmpty();
            boolean conflictsUnavail = !unavailRepo.findActiveOverlapping(resource.getId(), start, end).isEmpty();

            if (!conflictsBooking && !conflictsUnavail) {
                // Count total past bookings to score busyness
                int busyCount = bookingRepo.findByResourceIdOrderByStartTimeDesc(resource.getId()).size();
                String note = buildNote(resource, busyCount);

                results.add(SlotSuggestion.builder()
                        .resourceId(resource.getId())
                        .resourceCode(resource.getCode())
                        .resourceName(resource.getName())
                        .building(resource.getBuilding())
                        .startTime(start.format(DT_FMT))
                        .endTime(end.format(DT_FMT))
                        .availableHours(durationHours)
                        .capacity(resource.getCapacity())
                        .note(note)
                        .build());
                break; // one best slot per resource
            }
        }
        return results;
    }

    // ── Reply Builder ─────────────────────────────────────────────────────────

    private String buildReply(String msg, String typeLabel, int durationHours,
                               List<SlotSuggestion> top, LocalDate date) {
        if (top.isEmpty()) {
            return "No available " + typeLabel + "s found for " + durationHours + " hours on " + date
                    + ". Try a different date or shorter duration.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("I found ").append(top.size()).append(" available ").append(typeLabel)
          .append("(s) for ").append(durationHours).append(" hour(s) on ").append(date).append(":\n\n");

        for (int i = 0; i < top.size(); i++) {
            SlotSuggestion s = top.get(i);
            sb.append(i + 1).append(". **").append(s.getResourceName())
              .append("** (").append(s.getResourceCode()).append(") - ")
              .append(s.getBuilding()).append("\n")
              .append("   Available: ").append(s.getStartTime()).append(" to ").append(s.getEndTime()).append("\n")
              .append("   Capacity: ").append(s.getCapacity()).append(" seats. ")
              .append(s.getNote()).append("\n\n");
        }
        sb.append("Click 'Book' next to a suggestion to confirm your reservation.");
        return sb.toString();
    }

    private String buildNote(CampusResource r, int busyCount) {
        if (busyCount == 0) return "Rarely booked - great quiet spot.";
        if (busyCount < 5) return "Lightly used " + r.getBuilding() + " space.";
        if (busyCount < 15) return "Moderately popular. Book early!";
        return "Very popular " + r.getBuilding() + " room - grab it now.";
    }

    private int buildingOrder(String building) {
        if ("Main Building".equals(building)) return 0;
        if ("New Building".equals(building)) return 1;
        return 2;
    }
}
