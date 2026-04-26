package com.lms.assessment.dto.campus;

import com.lms.assessment.model.campus.CampusResource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCampusResourceRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    @NotNull
    private CampusResource.ResourceType type;

    @Min(1)
    private int capacity = 1;

    private Integer floor;

    private String description;
}
