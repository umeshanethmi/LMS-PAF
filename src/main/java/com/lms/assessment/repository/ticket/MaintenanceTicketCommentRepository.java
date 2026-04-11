package com.lms.assessment.repository.ticket;

import com.lms.assessment.model.ticket.MaintenanceTicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTicketCommentRepository extends JpaRepository<MaintenanceTicketComment, Long> {
    List<MaintenanceTicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
