package com.lms.assessment.repository.campus;

import com.lms.assessment.model.campus.ResourceBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {

    List<ResourceBooking> findByUserIdOrderByStartTimeDesc(String userId);

    List<ResourceBooking> findByResourceIdOrderByStartTimeDesc(String resourceId);

    /** Find all active bookings for a resource that overlap with [start, end) */
    @Query("{ 'resourceId': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, 'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
    List<ResourceBooking> findOverlapping(String resourceId, LocalDateTime start, LocalDateTime end);

    /** Count all approved bookings for a resource that overlap with a point in time */
    @Query("{ 'resourceId': ?0, 'status': 'APPROVED', 'startTime': { $lte: ?1 }, 'endTime': { $gt: ?1 } }")
    List<ResourceBooking> findActiveAt(String resourceId, LocalDateTime at);

    List<ResourceBooking> findByResourceIdAndStatusOrderByStartTimeAsc(String resourceId, ResourceBooking.BookingStatus status);
}
