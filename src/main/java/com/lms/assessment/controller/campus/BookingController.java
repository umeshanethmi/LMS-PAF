package com.lms.assessment.controller.campus;

import com.lms.assessment.dto.campus.BookingRequest;
import com.lms.assessment.dto.campus.BookingResponse;
import com.lms.assessment.dto.campus.UpdateBookingStatusRequest;
import com.lms.assessment.service.campus.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest req,
                                                   Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(bookingService.create(req, userId));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> list(Authentication auth,
                                                       @RequestParam(required = false) Boolean mine) {
        String userId = auth != null ? (String) auth.getPrincipal() : null;
        if (Boolean.TRUE.equals(mine) && userId != null) {
            return ResponseEntity.ok(bookingService.getByUser(userId));
        }
        return ResponseEntity.ok(bookingService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    /** Admin: approve or reject a booking */
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(@PathVariable String id,
                                                         @Valid @RequestBody UpdateBookingStatusRequest req,
                                                         Authentication auth) {
        String actorId = (String) auth.getPrincipal();
        return ResponseEntity.ok(bookingService.updateStatus(id, req, actorId));
    }

    /** User: cancel own booking */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable String id, Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(bookingService.cancel(id, userId));
    }

    /** Admin: hard-delete a booking record */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        bookingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Get current occupancy (sum of party sizes) for a resource at a time */
    @GetMapping("/occupancy")
    public ResponseEntity<?> occupancy(@RequestParam String resourceId,
                                        @RequestParam String at) {
        java.time.LocalDateTime atTime = java.time.LocalDateTime.parse(at);
        int count = bookingService.getOccupancy(resourceId, atTime);
        return ResponseEntity.ok(java.util.Map.of("resourceId", resourceId, "occupancy", count, "at", at));
    }
}
