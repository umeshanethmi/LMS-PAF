package com.lms.assessment.dto.ticket;

import com.lms.assessment.model.ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {

    @NotNull(message = "New status is required")
    private TicketStatus newStatus;

    @Size(max = 4000, message = "Resolution notes must be at most 4000 characters")
    private String resolutionNotes;
}
