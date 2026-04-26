package com.lms.assessment.controller.campus;

import com.lms.assessment.dto.campus.BookingChatRequest;
import com.lms.assessment.dto.campus.BookingChatResponse;
import com.lms.assessment.service.campus.BookingRecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/booking-chat")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingChatController {

    private final BookingRecommendationService bookingRecommendationService;

    public BookingChatController(BookingRecommendationService bookingRecommendationService) {
        this.bookingRecommendationService = bookingRecommendationService;
    }

    @PostMapping
    public ResponseEntity<BookingChatResponse> chat(
            @Valid @RequestBody BookingChatRequest request) {
        return ResponseEntity.ok(
                bookingRecommendationService.recommendFromMessage(request));
    }
}