package com.lms.assessment.controller.ticket;

import com.lms.assessment.model.ticket.MaintenanceTicketComment;
import com.lms.assessment.repository.ticket.MaintenanceTicketCommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/deprecated/maintenancetickets/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceTicketCommentController {

    private final MaintenanceTicketCommentRepository repository;

    public MaintenanceTicketCommentController(MaintenanceTicketCommentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<MaintenanceTicketComment> addComment(@RequestBody MaintenanceTicketComment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(comment));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<MaintenanceTicketComment>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(repository.findByTicketIdOrderByCreatedAtAsc(ticketId));
    }
}
