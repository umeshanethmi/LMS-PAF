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
public class CreateAssignmentRequest {
    private Long courseId;
    private Long createdByInstructorId;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private String allowedFileTypes;
    private Long maxFileSizeBytes;
    private Integer totalMarks;
    private Boolean published;
}
