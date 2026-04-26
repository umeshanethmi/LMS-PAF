package com.lms.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private String id;
    private String quizId;
    private String questionText;
    private String questionType;
    private List<String> options;
    // We typically omit correct_answer from the generic response unless it's for an instructor
    private Integer marks;
}
