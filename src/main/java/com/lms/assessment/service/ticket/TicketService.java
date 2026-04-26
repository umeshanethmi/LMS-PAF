package com.lms.assessment.service.ticket;

import com.lms.assessment.dto.ticket.*;
import com.lms.assessment.model.ticket.TicketActorRole;

import java.util.List;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request);

    List<TicketResponse> getAllTickets(String currentUserId, TicketActorRole actorRole);

    TicketResponse getTicketById(String ticketId);

    TicketResponse assignTechnician(String ticketId, AssignTechnicianRequest request, String currentUserId,
                                    TicketActorRole actorRole);

    TicketResponse updateTicketStatus(String ticketId, UpdateTicketStatusRequest request,
                                      String currentUserId, TicketActorRole actorRole);

    TicketCommentResponse addComment(String ticketId, CreateCommentRequest request, String currentUserId, TicketActorRole role);

    TicketCommentResponse updateComment(String ticketId, String commentId, UpdateCommentRequest request, String currentUserId);

    void deleteComment(String ticketId, String commentId, String currentUserId, TicketActorRole actorRole);

    TicketResponse startWork(String ticketId, String techId);
}
