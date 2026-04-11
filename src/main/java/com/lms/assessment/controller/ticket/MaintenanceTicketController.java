package com.lms.assessment.controller.ticket;

import com.lms.assessment.model.ticket.MaintenanceTicket;
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

@RestController
@RequestMapping("/api/maintenancetickets")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceTicketController {

    private final MaintenanceTicketRepository repository;
    private final FileStorageService fileStorageService;

    public MaintenanceTicketController(MaintenanceTicketRepository repository, FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTicket(
            @ModelAttribute MaintenanceTicket ticket,
            @RequestParam(value = "images", required = false) MultipartFile[] files) {

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
    public ResponseEntity<List<MaintenanceTicket>> getAllTickets() {
        return ResponseEntity.ok(repository.findAll());
    }
}
