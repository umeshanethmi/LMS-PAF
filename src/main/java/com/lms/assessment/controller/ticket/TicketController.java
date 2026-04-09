package com.lms.assessment.controller.ticket;

import com.lms.assessment.dto.ticket.*;
import com.lms.assessment.service.ticket.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // STEP 7: Create ticket with up to 3 image files
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("priority") com.lms.assessment.model.ticket.Priority priority,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "facilityId", required = false) Long facilityId,
            @RequestParam(value = "preferredContact", required = false) String preferredContact,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        CreateTicketRequest request = CreateTicketRequest.builder()
                .title(title)
                .description(description)
                .category(category)
                .priority(priority)
                .location(location)
                .facilityId(facilityId)
                .preferredContact(preferredContact)
                .files(files)
                .build();

        return ResponseEntity.ok(ticketService.createTicket(request, currentUserId));
    }

    // STEP 7: Get tickets for logged-in user
    @GetMapping("/me")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "canViewAll", defaultValue = "false") boolean canViewAll) {
        return ResponseEntity.ok(ticketService.getMyTickets(currentUserId, canViewAll));
    }

    // STEP 7: Get single ticket with attachments + comments if allowed
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable("id") Long id,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "canViewAll", defaultValue = "false") boolean canViewAll) {
        return ResponseEntity.ok(ticketService.getTicketByIdForUser(id, currentUserId, canViewAll));
    }

    // STEP 7: Update status (TECHNICIAN/ADMIN)
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable("id") Long id,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "isStaffOrAdmin", defaultValue = "false") boolean isStaffOrAdmin,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, currentUserId, isStaffOrAdmin));
    }

    // STEP 7: Add comment
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable("id") Long id,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "canViewAll", defaultValue = "false") boolean canViewAll,
            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.ok(ticketService.addComment(id, request, currentUserId, canViewAll));
    }

    // STEP 7: Delete comment (author or ADMIN/TECHNICIAN)
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("id") Long ticketId,
            @PathVariable("commentId") Long commentId,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "isStaffOrAdmin", defaultValue = "false") boolean isStaffOrAdmin) {
        ticketService.deleteComment(ticketId, commentId, currentUserId, isStaffOrAdmin);
        return ResponseEntity.noContent().build();
    }
}
