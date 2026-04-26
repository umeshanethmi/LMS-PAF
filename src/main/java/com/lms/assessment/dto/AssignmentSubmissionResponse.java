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
public class AssignmentSubmissionResponse {
    private String id;
    private String assignmentId;
    private String studentId;
    private LocalDateTime submittedAt;
    private String textAnswer;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private Integer obtainedMarks;
    private String feedback;
    private String status;
}
