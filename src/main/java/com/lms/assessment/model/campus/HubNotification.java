package com.lms.assessment.model.campus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "hub_notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HubNotification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;
    private String body;

    private NotificationType type;

    /** Optional reference: booking id or ticket id */
    private String refId;

    @Builder.Default
    private boolean read = false;

    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING, TICKET, SYSTEM
    }
}
