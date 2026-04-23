package com.lms.assessment.model.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

    @Id
    private String id;

    private String ticketId;

    private String authorUserId;

    private String author;

    private TicketActorRole authorRole;

    private String message;

    private LocalDateTime createdAt;
}
