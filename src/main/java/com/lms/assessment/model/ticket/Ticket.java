package com.lms.assessment.model.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    private String id;

    @Indexed
    private String email;

    private String location;

    private String category;

    private String description;

    private Priority priority;

    private String contactDetails;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Indexed
    private String reporterUserId;

    @Indexed
    private String assignedTechnicianId;

    private String resolutionNotes;

    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
    private LocalDateTime dispatchedAt;
    
    private LocalDateTime resolvedAt;
    
    private LocalDateTime closedAt;
    
    private Integer rating;
    
    private String feedbackComment;
}
