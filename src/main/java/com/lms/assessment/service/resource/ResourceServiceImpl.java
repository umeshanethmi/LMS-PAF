package com.lms.assessment.service.resource;

import com.lms.assessment.dto.resource.CreateResourceRequest;
import com.lms.assessment.dto.resource.ResourceResponse;
import com.lms.assessment.dto.resource.UpdateResourceRequest;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.model.Resource;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import com.lms.assessment.repository.resource.ResourceRepository;
import com.lms.assessment.repository.resource.ResourceSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceSpecification resourceSpecification;

    public ResourceServiceImpl(ResourceRepository resourceRepository,
                               ResourceSpecification resourceSpecification) {
        this.resourceRepository = resourceRepository;
        this.resourceSpecification = resourceSpecification;
    }

    @Override
    public ResourceResponse createResource(CreateResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .status(request.getStatus())
                .availabilityStart(request.getAvailabilityStart())
                .availabilityEnd(request.getAvailabilityEnd())
                .availableDays(request.getAvailableDays())
                .imageUrl(request.getImageUrl())
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Created resource with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    public ResourceResponse getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        return mapToResponse(resource);
    }

    @Override
    public List<ResourceResponse> getAllResources(ResourceType type, Integer minCapacity, String location, ResourceStatus status) {
        return resourceSpecification.findWithFilters(type, minCapacity, location, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponse updateResource(String id, UpdateResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setDescription(request.getDescription());
        resource.setStatus(request.getStatus());
        resource.setAvailabilityStart(request.getAvailabilityStart());
        resource.setAvailabilityEnd(request.getAvailabilityEnd());
        resource.setAvailableDays(request.getAvailableDays());
        resource.setImageUrl(request.getImageUrl());

        Resource saved = resourceRepository.save(resource);
        log.info("Updated resource with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource", "id", id);
        }
        resourceRepository.deleteById(id);
        log.info("Deleted resource with id: {}", id);
    }

    @Override
    public ResourceResponse updateStatus(String id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
        resource.setStatus(status);
        Resource saved = resourceRepository.save(resource);
        log.info("Updated status of resource {} to {}", id, status);
        return mapToResponse(saved);
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .description(resource.getDescription())
                .status(resource.getStatus())
                .availabilityStart(resource.getAvailabilityStart())
                .availabilityEnd(resource.getAvailabilityEnd())
                .availableDays(resource.getAvailableDays())
                .imageUrl(resource.getImageUrl())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
