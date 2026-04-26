package com.lms.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    private String id;

    private String courseId;

    private String createdByInstructorId;

    private String title;

    private String description;

    private LocalDateTime dueDate;

    /** E.g. "application/pdf,application/msword". */
    private String allowedFileTypes;

    private Long maxFileSizeBytes;

    private Integer totalMarks;

    @Builder.Default
    private Boolean published = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
