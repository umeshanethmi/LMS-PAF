package com.lms.assessment.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private QuizQuestion question;

    @Column(length = 2000)
    private String givenAnswer;

    private Boolean correct;

    private Integer awardedMarks;
}
