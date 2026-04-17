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

import com.lms.assessment.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final FileStorageService fileStorageService;

    public TicketController(TicketService ticketService, FileStorageService fileStorageService) {
        this.ticketService = ticketService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @ModelAttribute CreateTicketRequest request) {

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

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable("id") Long ticketId,
            @PathVariable("commentId") Long commentId,
            @RequestParam("currentUserId") @NotNull Long currentUserId,
            @Valid @RequestBody UpdateCommentRequest request) {

        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, request, currentUserId));
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

    @GetMapping("/attachments/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName, HttpServletRequest request) {
        try {
            Resource resource = fileStorageService.loadFileAsResource(fileName);
            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
