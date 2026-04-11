package com.lms.assessment.repository;

import com.lms.assessment.model.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
    List<QuizAnswer> findByAttemptId(Long attemptId);
    Optional<QuizAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
