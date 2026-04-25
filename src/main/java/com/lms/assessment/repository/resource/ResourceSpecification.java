package com.lms.assessment.repository.resource;

import com.lms.assessment.model.Resource;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds Mongo queries for the resource catalogue's search/filter use case.
 *
 * Replaces the previous JPA Specification-based filtering. Kept on the same
 * package so the rest of the code didn't need to learn a new API name.
 */
@Component
public class ResourceSpecification {

    private final MongoTemplate mongoTemplate;

    public ResourceSpecification(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<Resource> findWithFilters(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status) {

        List<Criteria> criteria = new ArrayList<>();

        if (type != null) {
            criteria.add(Criteria.where("type").is(type));
        }
        if (minCapacity != null) {
            criteria.add(Criteria.where("capacity").gte(minCapacity));
        }
        if (location != null && !location.isBlank()) {
            String escaped = java.util.regex.Pattern.quote(location);
            criteria.add(Criteria.where("location").regex(escaped, "i"));
        }
        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }

        Query query = new Query();
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }
        return mongoTemplate.find(query, Resource.class);
    }
}
