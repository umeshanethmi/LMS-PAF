package com.lms.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    private String id;

    private String courseId;

    private String createdByInstructorId;

    private String title;

    private String description;

    private Integer totalMarks;

    private Integer maxAttempts;

    private LocalDateTime availableFrom;

    private LocalDateTime availableUntil;

    @Builder.Default
    private Boolean published = false;

    @Builder.Default
    private List<QuizQuestion> questions = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
