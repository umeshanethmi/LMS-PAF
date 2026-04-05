package com.lms.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    private Long courseId;
    private Long createdByInstructorId;
    private String title;
    private String description;
    private Integer totalMarks;
    private Integer maxAttempts;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private Boolean published;
}
