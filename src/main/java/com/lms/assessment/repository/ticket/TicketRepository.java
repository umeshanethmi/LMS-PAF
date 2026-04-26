package com.lms.assessment.repository.ticket;

import com.lms.assessment.model.ticket.Priority;
import com.lms.assessment.model.ticket.Ticket;
import com.lms.assessment.model.ticket.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import org.springframework.data.domain.Sort;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByAssignedTechnicianId(String assignedTechnicianId, Sort sort);
    
    List<Ticket> findByReporterUserId(String reporterUserId, Sort sort);

    List<Ticket> findByEmail(String email);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByPriority(Priority priority);
}
