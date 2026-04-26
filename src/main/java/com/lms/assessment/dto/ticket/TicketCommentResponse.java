package com.lms.assessment.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentResponse {

    private String id;
    private String ticketId;
    private String userId;
    private String authorUserId;
    private String author;
    private String authorRole;
    private String content;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}
