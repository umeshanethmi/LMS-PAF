package com.lms.assessment.model.campus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "resource_unavailability")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceUnavailability {

    @Id
    private String id;

    @Indexed
    private String resourceId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /** Reason such as "Sudden lecture", "Maintenance" */
    private String reason;

    private String reportedByUserId;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;
}
