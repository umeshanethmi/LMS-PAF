package com.lms.assessment.controller.ticket;

import com.lms.assessment.model.ticket.MaintenanceComment;
import com.lms.assessment.repository.ticket.MaintenanceCommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenancetickets/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceCommentController {

    private final MaintenanceCommentRepository repository;

    public MaintenanceCommentController(MaintenanceCommentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<MaintenanceComment> addComment(@RequestBody MaintenanceComment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        MaintenanceComment savedComment = repository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<MaintenanceComment>> getComments(@PathVariable Long ticketId) {
        List<MaintenanceComment> comments = repository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return ResponseEntity.ok(comments);
    }
}
