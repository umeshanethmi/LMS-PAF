package com.lms.assessment.service;

import com.lms.assessment.dto.AssignmentResponse;
import com.lms.assessment.dto.AssignmentSubmissionResponse;
import com.lms.assessment.dto.CreateAssignmentRequest;
import com.lms.assessment.dto.SubmitAssignmentRequest;
import org.springframework.core.io.Resource;

import java.util.List;

public interface AssignmentService {
    AssignmentResponse createAssignment(CreateAssignmentRequest request);
    AssignmentResponse getAssignmentById(Long id);
    List<AssignmentResponse> getAssignmentsByCourse(Long courseId);
    List<AssignmentResponse> getPublishedAssignmentsByCourse(Long courseId);
    
    AssignmentResponse updateAssignment(Long id, CreateAssignmentRequest request);
    void deleteAssignment(Long id);
    
    AssignmentSubmissionResponse submitAssignment(SubmitAssignmentRequest request);
    List<AssignmentSubmissionResponse> getSubmissionsByAssignment(Long assignmentId);
    AssignmentSubmissionResponse getSubmissionById(Long submissionId);
    
    AssignmentSubmissionResponse gradeSubmission(Long submissionId, Integer obtainedMarks, String feedback);
    Resource downloadSubmissionFile(Long submissionId);
}
