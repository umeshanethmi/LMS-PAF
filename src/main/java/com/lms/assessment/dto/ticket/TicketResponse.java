package com.lms.assessment.dto.ticket;

import com.lms.assessment.model.ticket.Priority;
import com.lms.assessment.model.ticket.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private Priority priority;
    private TicketStatus status;
    private String location;
    private Long facilityId;
    private String preferredContact;
    private Long reporterUserId;
    private Long technicianUserId;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
}
