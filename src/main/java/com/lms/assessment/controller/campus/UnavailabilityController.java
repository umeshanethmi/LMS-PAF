package com.lms.assessment.controller.campus;

import com.lms.assessment.dto.campus.UnavailabilityRequest;
import com.lms.assessment.model.campus.ResourceUnavailability;
import com.lms.assessment.service.campus.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources/{resourceId}/unavailability")
@CrossOrigin(origins = "http://localhost:5173")
public class UnavailabilityController {

    private final BookingService bookingService;

    public UnavailabilityController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ResourceUnavailability> markUnavailable(
            @PathVariable String resourceId,
            @Valid @RequestBody UnavailabilityRequest req,
            Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(bookingService.markUnavailable(resourceId, req, userId));
    }

    @DeleteMapping("/{unavailId}")
    public ResponseEntity<Void> clearUnavailability(@PathVariable String resourceId,
                                                     @PathVariable String unavailId) {
        bookingService.clearUnavailability(unavailId);
        return ResponseEntity.noContent().build();
    }
}
