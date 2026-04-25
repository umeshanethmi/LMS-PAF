package com.lms.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "assignment_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    private String id;

    @Indexed
    private String assignmentId;

    @Indexed
    private String studentId;

    @CreatedDate
    private LocalDateTime submittedAt;

    private String textAnswer;

    private String storedFilename;

    private String originalFilename;

    private String contentType;

    private Long fileSize;

    private Integer obtainedMarks;

    private String feedback;

    /** E.g. SUBMITTED, GRADED, LATE. */
    private String status;
}
