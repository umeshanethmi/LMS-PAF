package com.lms.assessment.repository.ticket;

import com.lms.assessment.model.ticket.MaintenanceComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceCommentRepository extends JpaRepository<MaintenanceComment, Long> {
    List<MaintenanceComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
