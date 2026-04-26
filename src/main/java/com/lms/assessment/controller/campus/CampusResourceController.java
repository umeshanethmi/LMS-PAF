package com.lms.assessment.controller.campus;

import com.lms.assessment.dto.campus.CampusResourceResponse;
import com.lms.assessment.dto.campus.CreateCampusResourceRequest;
import com.lms.assessment.dto.campus.UpdateCampusResourceRequest;
import com.lms.assessment.service.campus.CampusResourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:5173")
public class CampusResourceController {

    private final CampusResourceService campusResourceService;

    public CampusResourceController(CampusResourceService campusResourceService) {
        this.campusResourceService = campusResourceService;
    }

    @GetMapping
    public ResponseEntity<List<CampusResourceResponse>> list() {
        return ResponseEntity.ok(campusResourceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CampusResourceResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(campusResourceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CampusResourceResponse> create(
            @Valid @RequestBody CreateCampusResourceRequest request) {
        return ResponseEntity.ok(campusResourceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusResourceResponse> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateCampusResourceRequest request) {
        return ResponseEntity.ok(campusResourceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        campusResourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}