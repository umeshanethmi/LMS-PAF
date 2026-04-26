package com.lms.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Embedded question stored inside a {@link Quiz} document. Has its own
 * {@code id} so quiz-attempt answers can reference the question after
 * embedding (Mongo doesn't generate ids for sub-documents automatically).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    private String id;

    private String questionText;

    /** E.g. MCQ, TRUE_FALSE, SHORT_ANSWER. */
    private String questionType;

    private List<String> options;

    private String correctAnswer;

    private Integer marks;
}
