package com.lms.assessment.controller;

import com.lms.assessment.dto.*;
import com.lms.assessment.service.AssignmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/student/assignments")
@Validated
public class StudentAssignmentController {

    private final AssignmentService assignmentService;

    public StudentAssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PostMapping(value = "/{id}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssignmentSubmissionResponse> submitAssignment(
            @PathVariable Long id,
            @RequestParam("studentId") @jakarta.validation.constraints.NotNull Long studentId,
            @RequestParam(value = "textAnswer", required = false) String textAnswer,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        SubmitAssignmentRequest request = SubmitAssignmentRequest.builder()
                .assignmentId(id)
                .studentId(studentId)
                .textAnswer(textAnswer)
                .file(file)
                .build();
        
        return ResponseEntity.ok(assignmentService.submitAssignment(request));
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<AssignmentSubmissionResponse> getSubmission(@PathVariable Long submissionId) {
        return ResponseEntity.ok(assignmentService.getSubmissionById(submissionId));
    }
    
    @GetMapping("/submissions/{submissionId}/file")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long submissionId) {
        Resource resource = assignmentService.downloadSubmissionFile(submissionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
