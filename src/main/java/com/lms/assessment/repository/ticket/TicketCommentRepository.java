package com.lms.assessment.repository.ticket;

import com.lms.assessment.model.ticket.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT c FROM TicketComment c WHERE c.ticket.id = :ticketId ORDER BY c.createdAt ASC")
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(@org.springframework.data.repository.query.Param("ticketId") Long ticketId);
}
