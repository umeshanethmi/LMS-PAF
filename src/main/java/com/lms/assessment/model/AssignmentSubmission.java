package com.lms.assessment.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Assignment assignment;

    // Reference to external student/user ID
    @Column(nullable = false)
    private Long studentId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(length = 2000)
    private String textAnswer;

    private String storedFilename;

    private String originalFilename;

    private String contentType;

    private Long fileSize;

    private Integer obtainedMarks;

    @Column(length = 2000)
    private String feedback;

    // E.g. SUBMITTED, GRADED, LATE
    @Column(nullable = false)
    private String status;
}
