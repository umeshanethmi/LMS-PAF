package com.lms.assessment.dto.campus;

import com.lms.assessment.model.campus.ResourceBooking;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBookingStatusRequest {

    @NotNull
    private ResourceBooking.BookingStatus status;

    private String reason;
}
