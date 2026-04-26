package com.smartcampus.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Notification entity – stored in the "notifications" MongoDB collection.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String recipientId;
    
    private String message;
    private NotificationType type;

    @Builder.Default
    private boolean isRead = false;

    @CreatedDate
    private Instant createdAt;

    public enum NotificationType {
        BOOKING, TICKET
    }
}
