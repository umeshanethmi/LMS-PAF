package com.smartcampus.controller;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Notification.NotificationType;
import com.smartcampus.models.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * NotificationController – REST API for the Notification module.
 *
 * Base path: /api/notifications
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ Method │ Path                          │ Role        │ Purpose           │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ GET    │ /api/notifications            │ USER/any    │ Fetch own notifs  │
 * │ POST   │ /api/notifications            │ ADMIN/TECH  │ Create notif      │
 * │ PUT    │ /api/notifications/{id}/read  │ USER/any    │ Mark as read      │
 * │ DELETE │ /api/notifications/{id}       │ USER/any    │ Delete own notif  │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * All authenticated users (USER, ADMIN, TECHNICIAN) can access GET / PUT / DELETE
 * for their own notifications.  Only ADMIN and TECHNICIAN may POST (create)
 * notifications via the system endpoint.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    // ── 1. GET /api/notifications ─────────────────────────────────────────────

    /**
     * Fetch all notifications for the currently authenticated user.
     * Results are ordered newest-first.
     *
     * Also returns an unread count header X-Unread-Count for the bell badge.
     *
     * @param userDetails injected Spring Security principal
     * @return 200 with list of Notification objects
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentUser = resolveUser(userDetails);
        List<Notification> notifications =
                notificationService.getNotificationsForUser(currentUser.getId());
        long unreadCount = notificationService.countUnread(currentUser.getId());

        return ResponseEntity.ok()
                .header("X-Unread-Count", String.valueOf(unreadCount))
                .body(notifications);
    }

    // ── 2. POST /api/notifications ────────────────────────────────────────────

    /**
     * System-level endpoint to create a notification.
     * Restricted to ADMIN and TECHNICIAN roles only.
     *
     * Triggered by other backend modules (Booking, Ticket) when status changes.
     *
     * Request body:
     * {
     *   "recipientId": "<MongoDB _id of the user>",
     *   "message":     "Your booking has been approved.",
     *   "type":        "BOOKING"
     * }
     *
     * @param request validated request body
     * @return 201 Created with the persisted Notification document
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Notification> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {

        Notification created = notificationService.createNotification(
                request.getRecipientId(),
                request.getMessage(),
                request.getType()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ── 3. PUT /api/notifications/{id}/read ──────────────────────────────────

    /**
     * Mark a specific notification as read.
     * The service layer validates that the requesting user owns the notification.
     *
     * @param id          path variable – the notification's MongoDB _id
     * @param userDetails injected Spring Security principal
     * @return 200 with the updated Notification, or 403 if not owner
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> markAsRead(@PathVariable String id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = resolveUser(userDetails);
            Notification updated = notificationService.markAsRead(id, currentUser.getId());
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── 4. DELETE /api/notifications/{id} ────────────────────────────────────

    /**
     * Delete a notification by its ID.
     * Ownership is enforced in the service layer – users can only delete
     * their own notifications.
     *
     * @param id          path variable – the notification's MongoDB _id
     * @param userDetails injected Spring Security principal
     * @return 204 No Content on success, 403 if not owner, 404 if not found
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteNotification(@PathVariable String id,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User currentUser = resolveUser(userDetails);
            notificationService.deleteNotification(id, currentUser.getId());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Resolve the JWT principal (email) to a full MongoDB User object.
     * Throws 404-style exception if somehow the user is not in the DB.
     */
    private User resolveUser(UserDetails userDetails) {
        return authService.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found in database: "
                        + userDetails.getUsername()));
    }

    // ── Inner DTO ─────────────────────────────────────────────────────────────

    /**
     * Request body for POST /api/notifications.
     * Bean Validation annotations enforce presence of all required fields.
     */
    @Data
    public static class CreateNotificationRequest {

        @NotBlank(message = "recipientId is required")
        private String recipientId;

        @NotBlank(message = "message is required")
        private String message;

        @NotNull(message = "type must be BOOKING or TICKET")
        private NotificationType type;
    }
}
