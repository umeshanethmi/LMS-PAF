package com.lms.assessment.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "quiz_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Quiz quiz;

    @Column(nullable = false, length = 1000)
    private String questionText;

    // E.g. MCQ, TRUE_FALSE, SHORT_ANSWER
    @Column(nullable = false)
    private String questionType; 

    // E.g., JSON representation or comma-separated for options
    @ElementCollection
    @CollectionTable(name = "quiz_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_value")
    private List<String> options;

    @Column(nullable = false)
    private String correctAnswer;

    @Column(nullable = false)
    private Integer marks;
}
