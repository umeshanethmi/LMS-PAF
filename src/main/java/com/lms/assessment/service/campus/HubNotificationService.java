package com.lms.assessment.service.campus;

import com.lms.assessment.model.campus.HubNotification;
import com.lms.assessment.repository.campus.HubNotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class HubNotificationService {

    private final HubNotificationRepository repo;

    public HubNotificationService(HubNotificationRepository repo) {
        this.repo = repo;
    }

    public void notifyTicketEvent(String userId, String ticketId, String title, String body) {
        if (userId == null || userId.isBlank()) return;
        persist(userId, title, body, HubNotification.NotificationType.TICKET, ticketId);
    }

    public void notifyBookingEvent(String userId, String bookingId, String title, String body) {
        if (userId == null || userId.isBlank()) return;
        persist(userId, title, body, HubNotification.NotificationType.BOOKING, bookingId);
    }

    public List<HubNotification> getForUser(String userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countUnread(String userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }

    public void markRead(String notificationId) {
        repo.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }

    public void markAllRead(String userId) {
        List<HubNotification> unread = repo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        repo.saveAll(unread);
    }

    public void delete(String notificationId) {
        repo.deleteById(notificationId);
    }

    public void deleteAllForUser(String userId) {
        repo.deleteByUserId(userId);
    }

    private void persist(String userId, String title, String body,
                          HubNotification.NotificationType type, String refId) {
        HubNotification n = HubNotification.builder()
                .userId(userId)
                .title(title)
                .body(body)
                .type(type)
                .refId(refId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        repo.save(n);
    }
}
