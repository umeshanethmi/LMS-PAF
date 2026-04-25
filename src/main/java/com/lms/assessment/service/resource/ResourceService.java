package com.lms.assessment.service.resource;

import com.lms.assessment.dto.resource.CreateResourceRequest;
import com.lms.assessment.dto.resource.ResourceResponse;
import com.lms.assessment.dto.resource.UpdateResourceRequest;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;

import java.util.List;

public interface ResourceService {
    ResourceResponse createResource(CreateResourceRequest request);
    ResourceResponse getResourceById(String id);
    List<ResourceResponse> getAllResources(ResourceType type, Integer minCapacity, String location, ResourceStatus status);
    ResourceResponse updateResource(String id, UpdateResourceRequest request);
    void deleteResource(String id);
    ResourceResponse updateStatus(String id, ResourceStatus status);
}
