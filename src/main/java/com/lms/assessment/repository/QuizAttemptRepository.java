package com.lms.assessment.repository;

import com.lms.assessment.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByQuizId(String quizId);
    List<QuizAttempt> findByStudentId(String studentId);
    List<QuizAttempt> findByQuizIdAndStudentId(String quizId, String studentId);
}
