package com.lms.assessment.dto.campus;

import com.lms.assessment.model.campus.ResourceBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private String id;
    private String resourceId;
    private String resourceCode;
    private String resourceName;
    private String building;
    private String userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int partySize;
    private String purpose;
    private ResourceBooking.BookingStatus status;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingResponse from(ResourceBooking b,
                                       String resourceCode,
                                       String resourceName,
                                       String building) {
        return BookingResponse.builder()
                .id(b.getId())
                .resourceId(b.getResourceId())
                .resourceCode(resourceCode)
                .resourceName(resourceName)
                .building(building)
                .userId(b.getUserId())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .partySize(b.getPartySize())
                .purpose(b.getPurpose())
                .status(b.getStatus())
                .cancelReason(b.getCancelReason())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
