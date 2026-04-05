package com.lms.assessment.service;

import com.lms.assessment.dto.AssignmentResponse;
import com.lms.assessment.dto.AssignmentSubmissionResponse;
import com.lms.assessment.dto.CreateAssignmentRequest;
import com.lms.assessment.dto.SubmitAssignmentRequest;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.Assignment;
import com.lms.assessment.model.AssignmentSubmission;
import com.lms.assessment.repository.AssignmentRepository;
import com.lms.assessment.repository.AssignmentSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public AssignmentServiceImpl(AssignmentRepository assignmentRepository,
                                 AssignmentSubmissionRepository submissionRepository,
                                 FileStorageService fileStorageService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(CreateAssignmentRequest request) {
        Assignment assignment = Assignment.builder()
                .courseId(request.getCourseId())
                .createdByInstructorId(request.getCreatedByInstructorId())
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .allowedFileTypes(request.getAllowedFileTypes())
                .maxFileSizeBytes(request.getMaxFileSizeBytes())
                .totalMarks(request.getTotalMarks())
                .published(request.getPublished() != null ? request.getPublished() : false)
                .build();
                
        Assignment saved = assignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    @Override
    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", id));
        return mapToResponse(assignment);
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return assignments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<AssignmentResponse> getPublishedAssignmentsByCourse(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseIdAndPublishedTrue(courseId);
        return assignments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssignmentResponse updateAssignment(Long id, CreateAssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", id));
        
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        assignment.setAllowedFileTypes(request.getAllowedFileTypes());
        assignment.setMaxFileSizeBytes(request.getMaxFileSizeBytes());
        assignment.setTotalMarks(request.getTotalMarks());
        if (request.getPublished() != null) {
            assignment.setPublished(request.getPublished());
        }
        
        Assignment updated = assignmentRepository.save(assignment);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", id));
        
        // Securely delete associated submission files from disk to save space
        for (AssignmentSubmission submission : assignment.getSubmissions()) {
            if (submission.getStoredFilename() != null) {
                try {
                    fileStorageService.deleteFile(submission.getStoredFilename());
                } catch (Exception ex) {
                    // Log the error but allow DB deletion to proceed
                    System.err.println("Failed to delete file from disk: " + submission.getStoredFilename());
                }
            }
        }
        
        assignmentRepository.delete(assignment);
    }

    @Override
    @Transactional
    public AssignmentSubmissionResponse submitAssignment(SubmitAssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", request.getAssignmentId()));

        Optional<AssignmentSubmission> existingOpt = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), request.getStudentId());

        String storedFilename = null;
        String originalFilename = null;
        String contentType = null;
        Long fileSize = null;

        MultipartFile file = request.getFile();
        if (file != null && !file.isEmpty()) {
            if (assignment.getMaxFileSizeBytes() != null && file.getSize() > assignment.getMaxFileSizeBytes()) {
                throw new SubmissionException("File size exceeds maximum allowed size.");
            }
            // Need robust file type checking here later...

            storedFilename = fileStorageService.storeFile(file);
            originalFilename = file.getOriginalFilename();
            contentType = file.getContentType();
            fileSize = file.getSize();
        }

        String status = LocalDateTime.now().isAfter(assignment.getDueDate()) ? "LATE" : "SUBMITTED";

        AssignmentSubmission submission;
        if (existingOpt.isPresent()) {
            submission = existingOpt.get();
            // Delete old file if new one is provided
            if (submission.getStoredFilename() != null && storedFilename != null) {
                fileStorageService.deleteFile(submission.getStoredFilename());
            }
            submission.setTextAnswer(request.getTextAnswer() != null ? request.getTextAnswer() : submission.getTextAnswer());
            if (storedFilename != null) {
                submission.setStoredFilename(storedFilename);
                submission.setOriginalFilename(originalFilename);
                submission.setContentType(contentType);
                submission.setFileSize(fileSize);
            }
            submission.setStatus(status);
        } else {
            submission = AssignmentSubmission.builder()
                    .assignment(assignment)
                    .studentId(request.getStudentId())
                    .textAnswer(request.getTextAnswer())
                    .storedFilename(storedFilename)
                    .originalFilename(originalFilename)
                    .contentType(contentType)
                    .fileSize(fileSize)
                    .status(status)
                    .build();
        }

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapToSubmissionResponse(saved);
    }

    @Override
    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream().map(this::mapToSubmissionResponse).collect(Collectors.toList());
    }

    @Override
    public AssignmentSubmissionResponse getSubmissionById(Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("AssignmentSubmission", "id", submissionId));
        return mapToSubmissionResponse(submission);
    }

    @Override
    @Transactional
    public AssignmentSubmissionResponse gradeSubmission(Long submissionId, Integer obtainedMarks, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("AssignmentSubmission", "id", submissionId));
                
        if (obtainedMarks > submission.getAssignment().getTotalMarks()) {
            throw new SubmissionException("Obtained marks cannot exceed total marks.");
        }

        submission.setObtainedMarks(obtainedMarks);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");

        AssignmentSubmission saved = submissionRepository.save(submission);
        return mapToSubmissionResponse(saved);
    }

    @Override
    public Resource downloadSubmissionFile(Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("AssignmentSubmission", "id", submissionId));

        if (submission.getStoredFilename() == null) {
            throw new ResourceNotFoundException("No file found for this submission.");
        }

        return fileStorageService.loadFileAsResource(submission.getStoredFilename());
    }

    private AssignmentResponse mapToResponse(Assignment entity) {
        return AssignmentResponse.builder()
                .id(entity.getId())
                .courseId(entity.getCourseId())
                .createdByInstructorId(entity.getCreatedByInstructorId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .dueDate(entity.getDueDate())
                .allowedFileTypes(entity.getAllowedFileTypes())
                .maxFileSizeBytes(entity.getMaxFileSizeBytes())
                .totalMarks(entity.getTotalMarks())
                .published(entity.getPublished())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private AssignmentSubmissionResponse mapToSubmissionResponse(AssignmentSubmission entity) {
        return AssignmentSubmissionResponse.builder()
                .id(entity.getId())
                .assignmentId(entity.getAssignment().getId())
                .studentId(entity.getStudentId())
                .submittedAt(entity.getSubmittedAt())
                .textAnswer(entity.getTextAnswer())
                .originalFilename(entity.getOriginalFilename())
                .contentType(entity.getContentType())
                .fileSize(entity.getFileSize())
                .obtainedMarks(entity.getObtainedMarks())
                .feedback(entity.getFeedback())
                .status(entity.getStatus())
                .build();
    }
}
