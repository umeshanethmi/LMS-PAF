package com.lms.assessment.dto.resource;

import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1 if specified")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    private String availableDays;

    private String imageUrl;
}
