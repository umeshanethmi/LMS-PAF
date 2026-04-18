package com.lms.assessment.service.ticket;

import com.lms.assessment.dto.ticket.*;

import java.util.List;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request, Long currentUserId);

    /**
     * Normal users see only their own tickets; when canViewAll is true
     * (for technicians/admins) this returns all tickets.
     */
    List<TicketResponse> getMyTickets(Long currentUserId, boolean canViewAll);

    /**
     * Fetch a ticket for the current user, enforcing visibility rules
     * (normal users only see own tickets, technicians/admins can see all).
     */
    TicketResponse getTicketByIdForUser(Long ticketId, Long currentUserId, boolean canViewAll);

    /**
     * Update status according to workflow rules. Only staff/technicians/admins
     * should be allowed to change status; REJECTED is reserved for them.
     */
    TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request,
                                      Long currentUserId, boolean isStaffOrAdmin);

    TicketCommentResponse addComment(Long ticketId, CreateCommentRequest request, Long currentUserId,
                                     boolean canViewAll);

    void deleteComment(Long ticketId, Long commentId, Long currentUserId, boolean isStaffOrAdmin);
}
