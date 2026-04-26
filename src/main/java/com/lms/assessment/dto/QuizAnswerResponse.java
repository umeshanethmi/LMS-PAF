package com.lms.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerResponse {
    private String id;
    private String attemptId;
    private String questionId;
    private String givenAnswer;
    private Boolean correct;
    private Integer awardedMarks;
}
