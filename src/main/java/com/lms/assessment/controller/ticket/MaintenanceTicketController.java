package com.lms.assessment.controller.ticket;

import com.lms.assessment.model.ticket.MaintenanceComment;
import com.lms.assessment.model.ticket.MaintenanceTicket;
import com.lms.assessment.repository.ticket.MaintenanceCommentRepository;
import com.lms.assessment.repository.ticket.MaintenanceTicketRepository;
import com.lms.assessment.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenancetickets")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceTicketController {

    private final MaintenanceTicketRepository repository;
    private final MaintenanceCommentRepository commentRepository;
    private final FileStorageService fileStorageService;

    public MaintenanceTicketController(MaintenanceTicketRepository repository, 
                                     MaintenanceCommentRepository commentRepository,
                                     FileStorageService fileStorageService) {
        this.repository = repository;
        this.commentRepository = commentRepository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTicket(
            @ModelAttribute MaintenanceTicket ticket,
            @RequestParam(value = "images", required = false) MultipartFile[] files) {
        
        if (files != null && files.length > 3) {
            return ResponseEntity.badRequest()
                    .body("You can only upload up to 3 images");
        }

        try {
            ticket.setCreatedAt(LocalDateTime.now());
            
            if (ticket.getStatus() == null) {
                ticket.setStatus(MaintenanceTicket.Status.OPEN);
            }

            List<String> filePaths = new ArrayList<>();

            if (files != null) {
                int limit = Math.min(files.length, 3);
                for (int i = 0; i < limit; i++) {
                    MultipartFile file = files[i];
                    if (!file.isEmpty()) {
                        String filePath = fileStorageService.storeFile(file);
                        filePaths.add(filePath);
                    }
                }
            }
            
            ticket.setAttachmentPaths(filePaths);
            MaintenanceTicket savedTicket = repository.save(ticket);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTicket);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing ticket creation: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllTickets() {
        List<MaintenanceTicket> tickets = repository.findAll();
        List<Map<String, Object>> responseList = new ArrayList<>();
        
        for (MaintenanceTicket ticket : tickets) {
            responseList.add(mapToResponse(ticket));
        }
        
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getTicketById(@PathVariable("id") Long id) {
        Optional<MaintenanceTicket> ticketOpt = repository.findById(id);
        if (ticketOpt.isPresent()) {
            return ResponseEntity.ok(mapToResponse(ticketOpt.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ticket not found");
    }

    private Map<String, Object> mapToResponse(MaintenanceTicket ticket) {
        List<MaintenanceComment> comments = commentRepository.findByTicketIdOrderByTimestampAsc(ticket.getId());
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", ticket.getId());
        response.put("resourceId", ticket.getResourceId());
        response.put("description", ticket.getDescription());
        response.put("category", ticket.getCategory());
        response.put("priority", ticket.getPriority());
        response.put("location", ticket.getLocation());
        response.put("contactDetails", ticket.getContactDetails());
        response.put("status", ticket.getStatus());
        response.put("assignedTechnicianId", ticket.getAssignedTechnicianId());
        response.put("attachmentPaths", ticket.getAttachmentPaths());
        response.put("resolutionNotes", ticket.getResolutionNotes());
        response.put("createdAt", ticket.getCreatedAt());
        response.put("updatedAt", ticket.getUpdatedAt());
        response.put("comments", comments);
        
        return response;
    }

    @PostMapping("/{id}/comments")
    @ResponseBody
    public ResponseEntity<Object> addComment(
            @PathVariable("id") Long id,
            @RequestParam("currentUserId") Long currentUserId,
            @RequestBody Map<String, Object> payload) {
        try {
            Object contentObj = payload.get("content");
            String content = contentObj != null ? contentObj.toString() : null;
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment content is empty");
            }

            MaintenanceComment comment = new MaintenanceComment();
            comment.setTicketId(id);
            comment.setAuthorUserId(currentUserId);
            comment.setContent(content);
            comment.setTimestamp(LocalDateTime.now());
            
            MaintenanceComment saved = commentRepository.save(comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding comment: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> updateStatus(
            @PathVariable Long id, 
            @RequestParam("status") String status,
            @RequestParam(value = "resolutionNotes", required = false) String resolutionNotes) {
        try {
            Optional<MaintenanceTicket> ticketOpt = repository.findById(id);
            if (ticketOpt.isPresent()) {
                MaintenanceTicket ticket = ticketOpt.get();
                ticket.setStatus(MaintenanceTicket.Status.valueOf(status.toUpperCase()));
                if (resolutionNotes != null) {
                    ticket.setResolutionNotes(resolutionNotes);
                }
                ticket.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(repository.save(ticket));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ticket not found with id: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating status: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Object> assignTechnicianPut(@PathVariable Long id, @RequestParam("technicianId") String technicianId) {
        try {
            Optional<MaintenanceTicket> ticketOpt = repository.findById(id);
            if (ticketOpt.isPresent()) {
                MaintenanceTicket ticket = ticketOpt.get();
                ticket.setAssignedTechnicianId(technicianId);
                ticket.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(repository.save(ticket));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ticket not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning technician: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            return repository.findById(id).map(ticket -> {
                if (payload.containsKey("assignedTechnicianId")) {
                    ticket.setAssignedTechnicianId(payload.get("assignedTechnicianId"));
                } else if (payload.containsKey("technicianId")) {
                    ticket.setAssignedTechnicianId(payload.get("technicianId"));
                }
                return ResponseEntity.ok(repository.save(ticket));
            }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error assigning technician: " + e.getMessage());
        }
    }
}
