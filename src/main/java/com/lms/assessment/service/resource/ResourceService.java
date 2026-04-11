package com.lms.assessment.service.resource;

import com.lms.assessment.dto.resource.CreateResourceRequest;
import com.lms.assessment.dto.resource.ResourceResponse;
import com.lms.assessment.dto.resource.UpdateResourceRequest;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;

import java.util.List;

public interface ResourceService {
    ResourceResponse createResource(CreateResourceRequest request);
    ResourceResponse getResourceById(Long id);
    List<ResourceResponse> getAllResources(ResourceType type, Integer minCapacity, String location, ResourceStatus status);
    ResourceResponse updateResource(Long id, UpdateResourceRequest request);
    void deleteResource(Long id);
    ResourceResponse updateStatus(Long id, ResourceStatus status);
}
