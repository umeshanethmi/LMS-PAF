package com.lms.assessment.controller.campus;

import com.lms.assessment.model.campus.HubNotification;
import com.lms.assessment.service.campus.HubNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final HubNotificationService service;

    public NotificationController(HubNotificationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<HubNotification>> list(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.getForUser(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(Map.of("count", service.countUnread(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id) {
        service.markRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        service.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        service.deleteAllForUser(userId);
        return ResponseEntity.noContent().build();
    }
}
