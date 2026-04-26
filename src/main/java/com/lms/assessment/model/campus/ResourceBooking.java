package com.lms.assessment.model.campus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "resource_bookings")
@CompoundIndex(name = "resource_time_idx", def = "{'resourceId': 1, 'startTime': 1, 'endTime': 1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceBooking {

    @Id
    private String id;

    @Indexed
    private String resourceId;

    @Indexed
    private String userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /** Number of people using this booking */
    @Builder.Default
    private int partySize = 1;

    private String purpose;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String cancelReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
