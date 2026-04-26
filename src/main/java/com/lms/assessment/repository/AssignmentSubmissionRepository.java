package com.lms.assessment.repository;

import com.lms.assessment.model.AssignmentSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends MongoRepository<AssignmentSubmission, String> {
    List<AssignmentSubmission> findByAssignmentId(String assignmentId);
    List<AssignmentSubmission> findByStudentId(String studentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(String assignmentId, String studentId);
}
