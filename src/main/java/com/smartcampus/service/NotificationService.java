package com.smartcampus.service;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Notification.NotificationType;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * NotificationService – All business logic for the Notification module.
 *
 * This service is intentionally kept thin: it validates inputs,
 * delegates persistence to {@link NotificationRepository}, and throws
 * typed exceptions that the controller layer maps to HTTP status codes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // READ
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetch all notifications for a specific user, newest first.
     *
     * @param recipientId MongoDB _id of the requesting user
     * @return ordered list of Notification documents
     */
    public List<Notification> getNotificationsForUser(String recipientId) {
        log.debug("Fetching notifications for recipientId={}", recipientId);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    /**
     * Count unread notifications for a user (used by frontend badge).
     *
     * @param recipientId MongoDB _id of the requesting user
     * @return count of unread notifications
     */
    public long countUnread(String recipientId) {
        return notificationRepository.countByRecipientIdAndIsRead(recipientId, false);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create and persist a new notification.
     *
     * Triggered by other modules (booking / ticket) via the system endpoint
     * POST /api/notifications, which is restricted to ADMIN / TECHNICIAN roles.
     *
     * @param recipientId the target user's MongoDB _id
     * @param message     human-readable notification text (max 500 chars)
     * @param type        BOOKING or TICKET
     * @return the persisted Notification document with generated id & createdAt
     */
    public Notification createNotification(String recipientId,
                                           String message,
                                           NotificationType type) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Notification message must not be blank.");
        }
        if (message.length() > 500) {
            throw new IllegalArgumentException("Notification message exceeds 500 characters.");
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .message(message.trim())
                .type(type)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification [{}] for recipientId={}", type, recipientId);
        return saved;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE – Mark as Read
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mark a specific notification as read.
     *
     * Ownership check: only the recipient can mark their own notification.
     *
     * @param notificationId  MongoDB _id of the notification
     * @param requestingUserId MongoDB _id of the user making the request
     * @return the updated Notification document
     * @throws IllegalArgumentException if not found
     * @throws SecurityException        if the requesting user is not the recipient
     */
    public Notification markAsRead(String notificationId, String requestingUserId) {
        Notification notification = findByIdOrThrow(notificationId);
        assertOwnership(notification, requestingUserId);

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        log.debug("Notification {} marked as read by user {}", notificationId, requestingUserId);
        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Delete a notification by ID.
     *
     * Ownership check: only the recipient (or an ADMIN) should call this;
     * the controller enforces this via @PreAuthorize before reaching the service.
     *
     * @param notificationId  MongoDB _id of the notification
     * @param requestingUserId MongoDB _id of the requesting user
     */
    public void deleteNotification(String notificationId, String requestingUserId) {
        Notification notification = findByIdOrThrow(notificationId);
        assertOwnership(notification, requestingUserId);

        notificationRepository.deleteById(notificationId);
        log.info("Notification {} deleted by user {}", notificationId, requestingUserId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Notification findByIdOrThrow(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Notification not found: " + id));
    }

    private void assertOwnership(Notification notification, String userId) {
        if (!notification.getRecipientId().equals(userId)) {
            throw new SecurityException(
                    "User " + userId + " is not the recipient of notification "
                    + notification.getId());
        }
    }
}
