package com.lms.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "quiz_attempts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    private String id;

    @Indexed
    private String quizId;

    @Indexed
    private String studentId;

    private Integer attemptNumber;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private Integer obtainedMarks;

    /** E.g. IN_PROGRESS, COMPLETED. */
    private String status;

    @Builder.Default
    private List<QuizAnswer> answers = new ArrayList<>();
}
