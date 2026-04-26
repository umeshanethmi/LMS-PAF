package com.lms.assessment.repository.ticket;

import com.lms.assessment.model.ticket.TicketAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketAttachmentRepository extends MongoRepository<TicketAttachment, String> {

    List<TicketAttachment> findByTicketId(String ticketId);
}
