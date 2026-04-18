package com.lms.assessment.controller.resource;

import com.lms.assessment.dto.resource.CreateResourceRequest;
import com.lms.assessment.dto.resource.ResourceResponse;
import com.lms.assessment.dto.resource.UpdateResourceRequest;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import com.lms.assessment.service.resource.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"}, allowedHeaders = "*")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }
}
