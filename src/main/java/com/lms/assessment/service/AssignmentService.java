package com.lms.assessment.service;

import com.lms.assessment.dto.AssignmentResponse;
import com.lms.assessment.dto.AssignmentSubmissionResponse;
import com.lms.assessment.dto.CreateAssignmentRequest;
import com.lms.assessment.dto.SubmitAssignmentRequest;
import org.springframework.core.io.Resource;

import java.util.List;

public interface AssignmentService {
    AssignmentResponse createAssignment(CreateAssignmentRequest request);
    AssignmentResponse getAssignmentById(String id);
    List<AssignmentResponse> getAssignmentsByCourse(String courseId);
    List<AssignmentResponse> getPublishedAssignmentsByCourse(String courseId);

    AssignmentResponse updateAssignment(String id, CreateAssignmentRequest request);
    void deleteAssignment(String id);

    AssignmentSubmissionResponse submitAssignment(SubmitAssignmentRequest request);
    List<AssignmentSubmissionResponse> getSubmissionsByAssignment(String assignmentId);
    AssignmentSubmissionResponse getSubmissionById(String submissionId);

    AssignmentSubmissionResponse gradeSubmission(String submissionId, Integer obtainedMarks, String feedback);
    Resource downloadSubmissionFile(String submissionId);
}
