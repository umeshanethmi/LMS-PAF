package com.lms.assessment.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    
    @NotNull(message = "Course ID is required")
    private String courseId;
    
    @NotNull(message = "Instructor ID is required")
    private String createdByInstructorId;
    
    @NotBlank(message = "Title cannot be blank")
    private String title;
    
    private String description;
    
    @NotNull(message = "Total marks are required")
    @Min(value = 1, message = "Total marks must be at least 1")
    private Integer totalMarks;
    
    @NotNull(message = "Max attempts are required")
    @Min(value = 1, message = "Max attempts must be at least 1")
    private Integer maxAttempts;
    
    @FutureOrPresent(message = "Available from must be present or future")
    private LocalDateTime availableFrom;
    
    private LocalDateTime availableUntil;
    
    private Boolean published;
}
