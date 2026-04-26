package com.lms.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Embedded answer stored inside a {@link QuizAttempt} document. References
 * the embedded question by its id (set by the service when questions were
 * added to the parent {@link Quiz}).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswer {

    private String id;

    private String questionId;

    private String givenAnswer;

    private Boolean correct;

    private Integer awardedMarks;
}
