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

    private String id;
    private String email;
    private String location;
    private String category;
    private String description;
    private Priority priority;
    private TicketStatus status;
    private String contactDetails;
    private String preferredContact;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String reporterUserId;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
}
