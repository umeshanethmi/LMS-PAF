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
        CampusResource.ResourceType type = detectType(msg);
        String typeLabel = type == CampusResource.ResourceType.LAB ? "lab" : "lecture hall";
        int durationHours = detectDuration(msg);
        LocalDate date = parseDate(req.getPreferredDate());
        String preferredBlock    = detectBlock(msg);
        String preferredBuilding = detectBuilding(msg);
        Integer preferredFloor   = detectFloor(msg);
        Integer minCapacity      = detectCapacity(msg);

        List<CampusResource> candidates = resourceService.findActiveByType(type);
        if (candidates.isEmpty()) {
            return BookingChatResponse.builder()
                    .reply("No " + typeLabel + "s are registered in the system yet.")
                    .suggestions(Collections.emptyList()).build();
        }

        List<CampusResource> filtered = candidates.stream()
                .filter(r -> preferredBlock    == null || r.getCode().startsWith(preferredBlock))
                .filter(r -> preferredBuilding == null || preferredBuilding.equals(r.getBuilding()))
                .filter(r -> preferredFloor    == null || Objects.equals(r.getFloor(), preferredFloor))
                .filter(r -> minCapacity       == null || r.getCapacity() >= minCapacity)
                .collect(Collectors.toList());

        if (filtered.isEmpty()) {
            filtered = candidates.stream()
                    .filter(r -> preferredBuilding == null || preferredBuilding.equals(r.getBuilding()))
                    .filter(r -> minCapacity       == null || r.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }
        if (filtered.isEmpty()) filtered = candidates;

        List<SlotSuggestion> suggestions = new ArrayList<>();
        for (CampusResource resource : filtered) {
            suggestions.addAll(findAvailableSlots(resource, date, durationHours));
        }
        suggestions.sort(Comparator
                .comparingInt((SlotSuggestion s) -> buildingOrder(s.getBuilding(), preferredBuilding))
                .thenComparingInt(s -> -s.getAvailableHours()));

        List<SlotSuggestion> top = suggestions.stream().limit(5).collect(Collectors.toList());
        return BookingChatResponse.builder()
                .reply(buildReply(typeLabel, durationHours, top, date, preferredBlock, preferredBuilding, preferredFloor, minCapacity))
                .suggestions(top).build();
    }

    private CampusResource.ResourceType detectType(String msg) {
        if (msg.contains("lab") || msg.contains("computer lab") || msg.contains("science lab")
                || msg.contains("chemistry lab") || msg.contains("physics lab")
                || msg.contains("biology lab") || msg.contains("it lab")) {
            return CampusResource.ResourceType.LAB;
        }
        return CampusResource.ResourceType.HALL;
    }

    private int detectDuration(String msg) {
        Matcher m = Pattern.compile("(\\d+)\\s*(?:hour|hr|h)s?").matcher(msg);
        if (m.find()) return Math.max(1, Math.min(8, Integer.parseInt(m.group(1))));
        return 2;
    }

    private String detectBlock(String msg) {
        Matcher m = Pattern.compile("(?:block|wing|in)\\s+([abfg])\\b").matcher(msg);
        if (m.find()) return m.group(1).toUpperCase();
        Matcher cm = Pattern.compile("\\b([abfg])\\d").matcher(msg);
        if (cm.find()) return cm.group(1).toUpperCase();
        return null;
    }

    private String detectBuilding(String msg) {
        if (msg.contains("main building") || msg.contains("main block")
                || msg.contains("block a") || msg.contains("block b")
                || msg.contains("wing a")  || msg.contains("wing b")) return "Main Building";
        if (msg.contains("new building") || msg.contains("new block")
                || msg.contains("block f") || msg.contains("block g")
                || msg.contains("wing f")  || msg.contains("wing g"))  return "New Building";
        return null;
    }

    private Integer detectFloor(String msg) {
        Matcher m = Pattern.compile("(?:floor|level)\\s*(\\d{1,2})|\\b(\\d{1,2})(?:st|nd|rd|th)?\\s*floor").matcher(msg);
        if (m.find()) {
            String g = m.group(1) != null ? m.group(1) : m.group(2);
            try { return Integer.parseInt(g); } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private Integer detectCapacity(String msg) {
        Matcher m = Pattern.compile("(?:for|capacity|seats?|people|persons?|students?)\\s*(\\d+)|(\\d+)\\s*(?:people|persons?|students?|seats?)").matcher(msg);
        if (m.find()) {
            String g = m.group(1) != null ? m.group(1) : m.group(2);
            try { int c = Integer.parseInt(g); if (c >= 5 && c <= 500) return c; } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private LocalDate parseDate(String preferredDate) {
        if (preferredDate != null && !preferredDate.isBlank()) {
            try { return LocalDate.parse(preferredDate); } catch (Exception ignored) {}
        }
        return LocalDate.now().plusDays(1);
    }

    private List<SlotSuggestion> findAvailableSlots(CampusResource resource, LocalDate date, int durationHours) {
        List<SlotSuggestion> results = new ArrayList<>();
        for (LocalTime[] w : CANDIDATE_SLOTS) {
            LocalDateTime start = LocalDateTime.of(date, w[0]);
            LocalDateTime end = start.plusHours(durationHours);
            if (end.getHour() > 21) continue;
            if (!bookingRepo.findOverlapping(resource.getId(), start, end).isEmpty()) continue;
            if (!unavailRepo.findActiveOverlapping(resource.getId(), start, end).isEmpty()) continue;
            int busyCount = bookingRepo.findByResourceIdOrderByStartTimeDesc(resource.getId()).size();
            results.add(SlotSuggestion.builder()
                    .resourceId(resource.getId())
                    .resourceCode(resource.getCode())
                    .resourceName(resource.getName())
                    .building(resource.getBuilding())
                    .startTime(start.format(DT_FMT))
                    .endTime(end.format(DT_FMT))
                    .availableHours(durationHours)
                    .capacity(resource.getCapacity())
                    .note(buildNote(resource, busyCount))
                    .build());
            break;
        }
        return results;
    }

    private String buildReply(String typeLabel, int durationHours, List<SlotSuggestion> top, LocalDate date,
                               String preferredBlock, String preferredBuilding, Integer preferredFloor, Integer minCapacity) {
        if (top.isEmpty()) {
            StringBuilder sb = new StringBuilder("Sorry, no available ").append(typeLabel)
                    .append("s found for ").append(durationHours).append(" hour(s) on ").append(date).append(".");
            if (preferredBlock != null)  sb.append(" Block ").append(preferredBlock).append(" has no free slots.");
            if (preferredFloor != null)  sb.append(" Floor ").append(preferredFloor).append(" is fully booked.");
            if (minCapacity != null)     sb.append(" No room meets the ").append(minCapacity).append("-seat requirement.");
            return sb.append("\n\nTry a different date, shorter duration, or a different building.").toString();
        }
        StringBuilder sb = new StringBuilder("Here are ").append(top.size())
                .append(" available ").append(typeLabel).append("(s) for ")
                .append(durationHours).append(" hour(s) on ").append(date);
        if (preferredBlock != null)          sb.append(" in Block ").append(preferredBlock);
        else if (preferredBuilding != null)  sb.append(" in the ").append(preferredBuilding);
        if (preferredFloor != null)          sb.append(", Floor ").append(preferredFloor);
        if (minCapacity != null)             sb.append(" (min ").append(minCapacity).append(" seats)");
        sb.append(":\n\n");
        for (int i = 0; i < top.size(); i++) {
            SlotSuggestion s = top.get(i);
            sb.append(i + 1).append(". **").append(s.getResourceName())
              .append("** (").append(s.getResourceCode()).append(") - ").append(s.getBuilding()).append("\n")
              .append("   Time: ").append(s.getStartTime()).append(" to ").append(s.getEndTime()).append("\n")
              .append("   Capacity: ").append(s.getCapacity()).append(" seats | ").append(s.getNote()).append("\n\n");
        }
        return sb.append("Click Book on any suggestion to confirm your reservation.").toString();
    }

    private String buildNote(CampusResource r, int busyCount) {
        if (busyCount == 0) return "Rarely used - great quiet spot.";
        if (busyCount < 5)  return "Lightly used " + r.getBuilding() + " space.";
        if (busyCount < 15) return "Moderately popular. Book early!";
        return "Very popular - grab it now!";
    }

    private int buildingOrder(String building, String preferred) {
        if (preferred != null && preferred.equals(building)) return 0;
        if ("Main Building".equals(building)) return 1;
        if ("New Building".equals(building))  return 2;
        return 3;
    }
}