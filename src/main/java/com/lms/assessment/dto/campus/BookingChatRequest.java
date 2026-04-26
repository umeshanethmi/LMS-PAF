package com.lms.assessment.dto.campus;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingChatRequest {

    @NotBlank
    private String message;

    /** Optional: authenticated user id for personalized recommendations */
    private String userId;

    /** Optional: preferred date in ISO-8601 (e.g. 2026-04-27) */
    private String preferredDate;
}
