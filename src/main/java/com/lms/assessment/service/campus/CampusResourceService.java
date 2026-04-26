package com.lms.assessment.service.campus;

import com.lms.assessment.dto.campus.CampusResourceResponse;
import com.lms.assessment.dto.campus.CreateCampusResourceRequest;
import com.lms.assessment.dto.campus.UpdateCampusResourceRequest;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.campus.CampusResource;
import com.lms.assessment.repository.campus.CampusResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CampusResourceService {

    private final CampusResourceRepository repo;

    public CampusResourceService(CampusResourceRepository repo) {
        this.repo = repo;
    }

    public List<CampusResourceResponse> findAll() {
        return repo.findByActiveTrue().stream()
                .map(CampusResourceResponse::from)
                .collect(Collectors.toList());
    }

    public CampusResourceResponse getById(String id) {
        CampusResource r = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CampusResource", "id", id));
        return CampusResourceResponse.from(r);
    }

    public CampusResourceResponse create(CreateCampusResourceRequest req) {
        if (repo.existsByCode(req.getCode().toUpperCase())) {
            throw new SubmissionException("A resource with code " + req.getCode() + " already exists.");
        }
        CampusResource r = CampusResource.builder()
                .code(req.getCode().toUpperCase())
                .name(req.getName())
                .type(req.getType())
                .capacity(req.getCapacity())
                .floor(req.getFloor())
                .description(req.getDescription())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return CampusResourceResponse.from(repo.save(r));
    }

    public CampusResourceResponse update(String id, UpdateCampusResourceRequest req) {
        CampusResource r = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CampusResource", "id", id));
        if (req.getName() != null) r.setName(req.getName());
        if (req.getType() != null) r.setType(req.getType());
        if (req.getCapacity() != null) r.setCapacity(req.getCapacity());
        if (req.getFloor() != null) r.setFloor(req.getFloor());
        if (req.getDescription() != null) r.setDescription(req.getDescription());
        if (req.getActive() != null) r.setActive(req.getActive());
        r.setUpdatedAt(LocalDateTime.now());
        return CampusResourceResponse.from(repo.save(r));
    }

    public void delete(String id) {
        CampusResource r = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CampusResource", "id", id));
        r.setActive(false);
        r.setUpdatedAt(LocalDateTime.now());
        repo.save(r);
    }

    public List<CampusResource> findActiveByType(CampusResource.ResourceType type) {
        return repo.findByTypeAndActiveTrue(type);
    }

    public List<CampusResource> findAllActive() {
        return repo.findByActiveTrue();
    }
}
