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
public class TicketAttachmentResponse {

    private String id;
    private String imagePath;
    private String fileUrl;
    private LocalDateTime createdAt;
}
