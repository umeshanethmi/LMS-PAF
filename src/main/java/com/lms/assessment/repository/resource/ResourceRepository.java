package com.lms.assessment.repository.resource;

import com.lms.assessment.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>,
        JpaSpecificationExecutor<Resource> {
}
