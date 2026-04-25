package com.smartcampus.repository;

import com.smartcampus.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    long countByRecipientIdAndIsRead(String recipientId, boolean isRead);
    void deleteByRecipientId(String recipientId);
}
