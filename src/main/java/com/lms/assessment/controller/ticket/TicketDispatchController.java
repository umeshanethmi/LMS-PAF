package com.lms.assessment.controller.ticket;

import com.lms.assessment.dto.ticket.TicketResponse;
import com.lms.assessment.service.ticket.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TicketDispatchController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @RequestBody com.lms.assessment.dto.ticket.CreateTicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @GetMapping("/technician/{techId}")
    public ResponseEntity<java.util.List<TicketResponse>> getTechnicianTickets(@PathVariable String techId) {
        return ResponseEntity.ok(ticketService.getTicketsByTechnician(techId));
    }

    @PutMapping("/{ticketId}/dispatch")
    public ResponseEntity<TicketResponse> dispatchTicket(
            @PathVariable String ticketId,
            @RequestParam String technicianId,
            @RequestParam String requestingUserId) {
        
        return ResponseEntity.ok(ticketService.dispatchTicket(ticketId, technicianId, requestingUserId));
    }

    @PatchMapping("/{ticketId}/resolve")
    public ResponseEntity<TicketResponse> resolveTicket(
            @PathVariable String ticketId,
            @RequestParam String technicianId,
            @RequestParam(required = false) String notes) {
        
        return ResponseEntity.ok(ticketService.resolveTicket(ticketId, technicianId, notes));
    }

    @PostMapping("/{ticketId}/feedback")
    public ResponseEntity<TicketResponse> submitFeedback(
            @PathVariable String ticketId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            @RequestParam String studentId) {
        
        return ResponseEntity.ok(ticketService.submitFeedback(ticketId, rating, comment, studentId));
    }
}
