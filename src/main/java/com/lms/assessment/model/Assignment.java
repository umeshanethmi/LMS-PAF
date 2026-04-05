package com.lms.assessment.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to external course ID
    @Column(nullable = false)
    private Long courseId;

    // Reference to external instructor/user ID
    @Column(nullable = false)
    private Long createdByInstructorId;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    // E.g., "application/pdf,application/msword"
    private String allowedFileTypes;

    private Long maxFileSizeBytes;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private Boolean published = false;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AssignmentSubmission> submissions = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
