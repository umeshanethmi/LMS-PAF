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
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final FileStorageService fileStorageService;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository,
                                 AssignmentSubmissionRepository submissionRepository,
                                 FileStorageService fileStorageService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
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

        return mapToResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponse getAssignmentById(String id) {
        return mapToResponse(loadAssignment(id));
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByCourse(String courseId) {
        return assignmentRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<AssignmentResponse> getPublishedAssignmentsByCourse(String courseId) {
        return assignmentRepository.findByCourseIdAndPublishedTrue(courseId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public AssignmentResponse updateAssignment(String id, CreateAssignmentRequest request) {
        Assignment assignment = loadAssignment(id);

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        assignment.setAllowedFileTypes(request.getAllowedFileTypes());
        assignment.setMaxFileSizeBytes(request.getMaxFileSizeBytes());
        assignment.setTotalMarks(request.getTotalMarks());
        if (request.getPublished() != null) {
            assignment.setPublished(request.getPublished());
        }

        return mapToResponse(assignmentRepository.save(assignment));
    }

    @Override
    public void deleteAssignment(String id) {
        Assignment assignment = loadAssignment(id);

        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(id);
        for (AssignmentSubmission submission : submissions) {
            if (submission.getStoredFilename() != null) {
                try {
                    fileStorageService.deleteFile(submission.getStoredFilename());
                } catch (Exception ex) {
                    log.error("Failed to delete file from disk: {}", submission.getStoredFilename(), ex);
                }
            }
        }
        submissionRepository.deleteAll(submissions);
        assignmentRepository.delete(assignment);
    }

    @Override
    public AssignmentSubmissionResponse submitAssignment(SubmitAssignmentRequest request) {
        Assignment assignment = loadAssignment(request.getAssignmentId());

        Optional<AssignmentSubmission> existingOpt =
                submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), request.getStudentId());

        String storedFilename = null;
        String originalFilename = null;
        String contentType = null;
        Long fileSize = null;

        MultipartFile file = request.getFile();
        if (file != null && !file.isEmpty()) {
            if (assignment.getMaxFileSizeBytes() != null && file.getSize() > assignment.getMaxFileSizeBytes()) {
                throw new SubmissionException("File size exceeds maximum allowed size.");
            }

            if (assignment.getAllowedFileTypes() != null && !assignment.getAllowedFileTypes().isBlank()) {
                String originalName = file.getOriginalFilename();
                String extension = "";
                if (originalName != null && originalName.lastIndexOf('.') > 0) {
                    extension = originalName.substring(originalName.lastIndexOf('.'));
                }

                String allowed = assignment.getAllowedFileTypes().toLowerCase();
                if (!allowed.contains(extension.toLowerCase())) {
                    throw new SubmissionException("Invalid file type. Allowed types: " + assignment.getAllowedFileTypes());
                }
            }

            storedFilename = fileStorageService.storeFile(file);
            originalFilename = file.getOriginalFilename();
            contentType = file.getContentType();
            fileSize = file.getSize();
        }

        String status = LocalDateTime.now().isAfter(assignment.getDueDate()) ? "LATE" : "SUBMITTED";

        AssignmentSubmission submission;
        if (existingOpt.isPresent()) {
            submission = existingOpt.get();
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
                    .assignmentId(assignment.getId())
                    .studentId(request.getStudentId())
                    .textAnswer(request.getTextAnswer())
                    .storedFilename(storedFilename)
                    .originalFilename(originalFilename)
                    .contentType(contentType)
                    .fileSize(fileSize)
                    .status(status)
                    .build();
        }

        return mapToSubmissionResponse(submissionRepository.save(submission));
    }

    @Override
    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToSubmissionResponse).collect(Collectors.toList());
    }

    @Override
    public AssignmentSubmissionResponse getSubmissionById(String submissionId) {
        return mapToSubmissionResponse(loadSubmission(submissionId));
    }

    @Override
    public AssignmentSubmissionResponse gradeSubmission(String submissionId, Integer obtainedMarks, String feedback) {
        AssignmentSubmission submission = loadSubmission(submissionId);
        Assignment assignment = loadAssignment(submission.getAssignmentId());

        if (assignment.getTotalMarks() != null && obtainedMarks > assignment.getTotalMarks()) {
            throw new SubmissionException("Obtained marks cannot exceed total marks.");
        }

        submission.setObtainedMarks(obtainedMarks);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");

        return mapToSubmissionResponse(submissionRepository.save(submission));
    }

    @Override
    public Resource downloadSubmissionFile(String submissionId) {
        AssignmentSubmission submission = loadSubmission(submissionId);
        if (submission.getStoredFilename() == null) {
            throw new ResourceNotFoundException("No file found for this submission.");
        }
        return fileStorageService.loadFileAsResource(submission.getStoredFilename());
    }

    private Assignment loadAssignment(String id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment", "id", id));
    }

    private AssignmentSubmission loadSubmission(String id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AssignmentSubmission", "id", id));
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
                .assignmentId(entity.getAssignmentId())
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
