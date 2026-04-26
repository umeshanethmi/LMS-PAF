package com.lms.assessment.repository.campus;

import com.lms.assessment.model.campus.HubNotification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface HubNotificationRepository extends MongoRepository<HubNotification, String> {

    List<HubNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    long countByUserIdAndReadFalse(String userId);

    void deleteByUserId(String userId);
}
