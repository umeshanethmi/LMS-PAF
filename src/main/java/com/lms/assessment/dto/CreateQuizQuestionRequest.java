package com.lms.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizQuestionRequest {
    
    private String quizId;
    
    @NotBlank(message = "Question text cannot be blank")
    private String questionText;
    
    @NotBlank(message = "Question type cannot be blank")
    private String questionType;
    
    private List<String> options;
    
    @NotBlank(message = "Correct answer cannot be blank")
    private String correctAnswer;
    
    @NotNull(message = "Marks are required")
    private Integer marks;
}
