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

    private Long id;
    private Long authorUserId;
    private String content;
    private LocalDateTime createdAt;
}
