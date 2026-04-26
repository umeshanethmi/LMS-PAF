package com.lms.assessment.repository.campus;

import com.lms.assessment.model.campus.CampusResource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CampusResourceRepository extends MongoRepository<CampusResource, String> {

    Optional<CampusResource> findByCode(String code);

    List<CampusResource> findByTypeAndActiveTrue(CampusResource.ResourceType type);

    List<CampusResource> findByActiveTrue();

    boolean existsByCode(String code);
}
