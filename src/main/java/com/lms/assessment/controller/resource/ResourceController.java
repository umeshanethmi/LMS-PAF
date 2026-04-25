package com.lms.assessment.controller.resource;

import com.lms.assessment.dto.resource.CreateResourceRequest;
import com.lms.assessment.dto.resource.ResourceResponse;
import com.lms.assessment.dto.resource.UpdateResourceRequest;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import com.lms.assessment.service.resource.ResourceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@Validated
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) @Positive(message = "minCapacity must be positive") Integer minCapacity,
            @RequestParam(required = false) @Size(max = 200, message = "location filter must be at most 200 characters") String location,
            @RequestParam(required = false) ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(
            @PathVariable @NotBlank(message = "id is required") String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable @NotBlank(message = "id is required") String id,
            @Valid @RequestBody UpdateResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable @NotBlank(message = "id is required") String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> updateStatus(
            @PathVariable @NotBlank(message = "id is required") String id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }
}
