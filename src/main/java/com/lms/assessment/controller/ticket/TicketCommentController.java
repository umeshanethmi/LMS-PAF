package com.lms.assessment.controller.ticket;

import com.lms.assessment.model.ticket.TicketComment;
import com.lms.assessment.repository.ticket.TicketCommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketCommentController {

    private final TicketCommentRepository repository;

    public TicketCommentController(TicketCommentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<TicketComment> addComment(@RequestBody TicketComment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(comment));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<TicketComment>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(repository.findByMaintenanceTicketIdOrderByCreatedAtAsc(ticketId));
    }
}
