package com.lms.assessment.repository;

import com.lms.assessment.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByCourseId(String courseId);
    List<Quiz> findByCourseIdAndPublishedTrue(String courseId);
    List<Quiz> findByCreatedByInstructorId(String instructorId);
}
