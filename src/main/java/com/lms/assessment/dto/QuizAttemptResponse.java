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
public class QuizAttemptResponse {
    private String id;
    private String quizId;
    private String studentId;
    private Integer attemptNumber;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer obtainedMarks;
    private String status;
}
