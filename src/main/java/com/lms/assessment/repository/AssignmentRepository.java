package com.lms.assessment.repository;

import com.lms.assessment.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByCourseIdAndPublishedTrue(Long courseId);
    List<Assignment> findByCreatedByInstructorId(Long instructorId);
}
