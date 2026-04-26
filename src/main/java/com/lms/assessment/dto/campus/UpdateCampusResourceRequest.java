package com.lms.assessment.dto.campus;

import com.lms.assessment.model.campus.CampusResource;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateCampusResourceRequest {

    private String name;

    private CampusResource.ResourceType type;

    @Min(1)
    private Integer capacity;

    private Integer floor;

    private String description;

    private Boolean active;
}
