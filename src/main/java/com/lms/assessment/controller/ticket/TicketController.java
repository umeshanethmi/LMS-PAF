package com.lms.assessment.controller.ticket;

import com.lms.assessment.dto.ticket.*;
import com.lms.assessment.model.ticket.Priority;
import com.lms.assessment.model.ticket.TicketActorRole;
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
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @RequestParam(value = "currentUserId", required = false) Long currentUserId,
            @RequestParam(value = "resourceId", required = false) String resourceId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("location") String location,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("priority") Priority priority,
            @RequestParam(value = "contactDetails", required = false) String contactDetails,
            @RequestParam(value = "preferredContact", required = false) String preferredContact,
            @RequestParam(value = "attachmentPaths", required = false) List<String> attachmentPaths,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {

        CreateTicketRequest request = CreateTicketRequest.builder()
                .resourceId(resourceId)
                .title(title)
                .location(location)
                .category(category)
                .description(description)
                .priority(priority)
                .contactDetails(contactDetails)
                .preferredContact(preferredContact)
                .attachmentPaths(attachmentPaths)
                .files(files)
                .build();

        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable("id") Long id,
            @RequestParam("technicianId") @NotNull String technicianId,
            @RequestParam(value = "currentUserId", required = false) Long currentUserId,
            @RequestParam(value = "role", defaultValue = "USER") TicketActorRole role) {

        AssignTechnicianRequest request = AssignTechnicianRequest.builder()
                .technicianId(technicianId)
                .build();

        return ResponseEntity.ok(ticketService.assignTechnician(id, request, currentUserId, role));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable("id") Long id,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "role", defaultValue = "USER") TicketActorRole role,
            @Valid @RequestBody UpdateTicketStatusRequest request) {

        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request, currentUserId, role));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable("id") Long id,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @Valid @RequestBody CreateCommentRequest request) {

        return ResponseEntity.ok(ticketService.addComment(id, request, currentUserId));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("id") Long ticketId,
            @PathVariable("commentId") Long commentId,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @RequestParam(value = "role", defaultValue = "USER") TicketActorRole role) {

        ticketService.deleteComment(ticketId, commentId, currentUserId, role);
        return ResponseEntity.noContent().build();
    }
}
