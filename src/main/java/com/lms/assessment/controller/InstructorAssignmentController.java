package com.lms.assessment.controller;

import com.lms.assessment.dto.*;
import com.lms.assessment.service.AssignmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/instructor/assignments")
public class InstructorAssignmentController {

    private final AssignmentService assignmentService;

    public InstructorAssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody CreateAssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.createAssignment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByAssignment(id));
    }

    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<AssignmentSubmissionResponse> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestParam Integer obtainedMarks,
            @RequestParam String feedback) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, obtainedMarks, feedback));
    }
    
    @GetMapping("/submissions/{submissionId}/file")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long submissionId) {
        Resource resource = assignmentService.downloadSubmissionFile(submissionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
