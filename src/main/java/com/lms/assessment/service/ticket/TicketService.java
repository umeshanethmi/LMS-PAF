package com.lms.assessment.service.ticket;

import com.lms.assessment.dto.ticket.*;
import com.lms.assessment.model.ticket.TicketActorRole;

import java.util.List;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request);

    List<TicketResponse> getAllTickets();

    TicketResponse getTicketById(Long ticketId);

    TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request, Long currentUserId,
                                    TicketActorRole actorRole);

    TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request,
                                      Long currentUserId, TicketActorRole actorRole);

    TicketCommentResponse addComment(Long ticketId, CreateCommentRequest request, Long currentUserId);

    void deleteComment(Long ticketId, Long commentId, Long currentUserId, TicketActorRole actorRole);
}
