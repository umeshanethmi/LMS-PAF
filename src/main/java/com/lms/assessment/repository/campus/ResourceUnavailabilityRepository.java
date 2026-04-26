package com.lms.assessment.repository.campus;

import com.lms.assessment.model.campus.ResourceUnavailability;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ResourceUnavailabilityRepository extends MongoRepository<ResourceUnavailability, String> {

    List<ResourceUnavailability> findByResourceIdAndActiveTrue(String resourceId);

    @Query("{ 'resourceId': ?0, 'active': true, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<ResourceUnavailability> findActiveOverlapping(String resourceId, LocalDateTime start, LocalDateTime end);
}
