package com.lms.assessment.model.ticket;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private MaintenanceTicket maintenanceTicket;

    @Transient
    @JsonProperty("ticketId")
    public void setTicketId(Long ticketId) {
        if (this.maintenanceTicket == null) {
            this.maintenanceTicket = new MaintenanceTicket();
        }
        this.maintenanceTicket.setId(ticketId);
    }

    private Long userId;
    private String author;
    private String message;
    private LocalDateTime createdAt;
}
