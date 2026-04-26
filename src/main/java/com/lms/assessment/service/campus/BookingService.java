package com.lms.assessment.service.campus;

import com.lms.assessment.dto.campus.*;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.campus.CampusResource;
import com.lms.assessment.model.campus.ResourceBooking;
import com.lms.assessment.model.campus.ResourceUnavailability;
import com.lms.assessment.repository.campus.CampusResourceRepository;
import com.lms.assessment.repository.campus.ResourceBookingRepository;
import com.lms.assessment.repository.campus.ResourceUnavailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final ResourceBookingRepository bookingRepo;
    private final CampusResourceRepository resourceRepo;
    private final ResourceUnavailabilityRepository unavailRepo;
    private final HubNotificationService notificationService;

    public BookingService(ResourceBookingRepository bookingRepo,
                          CampusResourceRepository resourceRepo,
                          ResourceUnavailabilityRepository unavailRepo,
                          HubNotificationService notificationService) {
        this.bookingRepo = bookingRepo;
        this.resourceRepo = resourceRepo;
        this.unavailRepo = unavailRepo;
        this.notificationService = notificationService;
    }

    // ── Conflict Check ──────────────────────────────────────────────────────

    public boolean hasConflict(String resourceId, LocalDateTime start, LocalDateTime end, String excludeBookingId) {
        List<ResourceBooking> overlapping = bookingRepo.findOverlapping(resourceId, start, end);
        return overlapping.stream().anyMatch(b -> !b.getId().equals(excludeBookingId));
    }

    public boolean hasUnavailabilityConflict(String resourceId, LocalDateTime start, LocalDateTime end) {
        return !unavailRepo.findActiveOverlapping(resourceId, start, end).isEmpty();
    }

    // ── Booking CRUD ─────────────────────────────────────────────────────────

    public BookingResponse create(BookingRequest req, String userId) {
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new SubmissionException("End time must be after start time.");
        }
        CampusResource resource = resourceRepo.findById(req.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("CampusResource", "id", req.getResourceId()));

        if (hasConflict(req.getResourceId(), req.getStartTime(), req.getEndTime(), "NONE")) {
            throw new SubmissionException("This resource is already booked for the requested time slot.");
        }
        if (hasUnavailabilityConflict(req.getResourceId(), req.getStartTime(), req.getEndTime())) {
            throw new SubmissionException("This resource is marked unavailable during the requested window.");
        }

        ResourceBooking booking = ResourceBooking.builder()
                .resourceId(req.getResourceId())
                .userId(userId)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .partySize(req.getPartySize())
                .purpose(req.getPurpose())
                .status(ResourceBooking.BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ResourceBooking saved = bookingRepo.save(booking);
        notificationService.notifyBookingEvent(userId, saved.getId(),
                "Booking submitted", "Your booking for " + resource.getName() + " is pending approval.");
        return toResponse(saved, resource);
    }

    public List<BookingResponse> getByUser(String userId) {
        return bookingRepo.findByUserIdOrderByStartTimeDesc(userId)
                .stream().map(b -> toResponseLazy(b)).collect(Collectors.toList());
    }

    public List<BookingResponse> getAll() {
        return bookingRepo.findAll().stream()
                .map(b -> toResponseLazy(b)).collect(Collectors.toList());
    }

    public BookingResponse getById(String id) {
        ResourceBooking b = bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return toResponseLazy(b);
    }

    public BookingResponse updateStatus(String id, UpdateBookingStatusRequest req, String actorUserId) {
        ResourceBooking b = bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        ResourceBooking.BookingStatus newStatus = req.getStatus();

        if (newStatus == ResourceBooking.BookingStatus.APPROVED
                && hasConflict(b.getResourceId(), b.getStartTime(), b.getEndTime(), b.getId())) {
            throw new SubmissionException("Cannot approve: another booking already exists for this slot.");
        }

        b.setStatus(newStatus);
        if (req.getReason() != null) b.setCancelReason(req.getReason());
        b.setUpdatedAt(LocalDateTime.now());
        ResourceBooking updated = bookingRepo.save(b);

        CampusResource resource = resourceRepo.findById(b.getResourceId()).orElse(null);
        String resourceName = resource != null ? resource.getName() : b.getResourceId();

        String title = newStatus == ResourceBooking.BookingStatus.APPROVED ? "Booking approved" : "Booking " + newStatus.name().toLowerCase();
        String body = "Your booking for " + resourceName + " has been " + newStatus.name().toLowerCase() + ".";
        notificationService.notifyBookingEvent(b.getUserId(), b.getId(), title, body);

        return toResponseLazy(updated);
    }

    public BookingResponse cancel(String id, String userId) {
        ResourceBooking b = bookingRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        if (!b.getUserId().equals(userId)) {
            throw new SubmissionException("You can only cancel your own bookings.");
        }
        b.setStatus(ResourceBooking.BookingStatus.CANCELLED);
        b.setUpdatedAt(LocalDateTime.now());
        return toResponseLazy(bookingRepo.save(b));
    }

    public void delete(String id) {
        bookingRepo.deleteById(id);
    }

    // ── Occupancy ────────────────────────────────────────────────────────────

    public int getOccupancy(String resourceId, LocalDateTime at) {
        return bookingRepo.findActiveAt(resourceId, at)
                .stream().mapToInt(ResourceBooking::getPartySize).sum();
    }

    // ── Unavailability ───────────────────────────────────────────────────────

    public ResourceUnavailability markUnavailable(String resourceId, UnavailabilityRequest req, String userId) {
        resourceRepo.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("CampusResource", "id", resourceId));
        ResourceUnavailability u = ResourceUnavailability.builder()
                .resourceId(resourceId)
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .reason(req.getReason())
                .reportedByUserId(userId)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        return unavailRepo.save(u);
    }

    public void clearUnavailability(String unavailId) {
        ResourceUnavailability u = unavailRepo.findById(unavailId)
                .orElseThrow(() -> new ResourceNotFoundException("Unavailability", "id", unavailId));
        u.setActive(false);
        unavailRepo.save(u);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private BookingResponse toResponse(ResourceBooking b, CampusResource r) {
        return BookingResponse.from(b, r.getCode(), r.getName(), r.getBuilding());
    }

    private BookingResponse toResponseLazy(ResourceBooking b) {
        CampusResource r = resourceRepo.findById(b.getResourceId()).orElse(null);
        String code = r != null ? r.getCode() : b.getResourceId();
        String name = r != null ? r.getName() : b.getResourceId();
        String building = r != null ? r.getBuilding() : "Unknown";
        return BookingResponse.from(b, code, name, building);
    }
}
