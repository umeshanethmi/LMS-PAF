package com.lms.assessment.repository.ticket;

import com.lms.assessment.model.ticket.Priority;
import com.lms.assessment.model.ticket.Ticket;
import com.lms.assessment.model.ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByAssignedTechnicianId(Long assignedTechnicianId);

    List<Ticket> findByResourceId(String resourceId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(Priority priority);
}
