package com.lms.assessment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAssignmentRequest {
    
    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private String textAnswer;
    
    private MultipartFile file;
}
