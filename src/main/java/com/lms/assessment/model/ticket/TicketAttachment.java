package com.lms.assessment.model.ticket;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ticket_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAttachment {

    @Id
    private String id;

    @Indexed
    private String ticketId;

    private String filePath;

    private String imagePath;

    private LocalDateTime createdAt;
}
