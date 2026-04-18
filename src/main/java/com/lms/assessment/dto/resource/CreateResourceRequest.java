package com.lms.assessment.dto.resource;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateResourceRequest {

    @NotBlank(message = "Resource name is required")
    @Size(max = 120, message = "Resource name must be at most 120 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1 if specified")
    @Max(value = 10_000, message = "Capacity must be at most 10000")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must be at most 200 characters")
    private String location;

    @Size(max = 2000, message = "Description must be at most 2000 characters")
    private String description;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    // Accepts either "MON,TUE,WED" or "MON:08:00-17:00,TUE:09:00-12:00"
    @Pattern(
            regexp = "^$|^(MON|TUE|WED|THU|FRI|SAT|SUN)(:\\d{2}:\\d{2}-\\d{2}:\\d{2})?(,(MON|TUE|WED|THU|FRI|SAT|SUN)(:\\d{2}:\\d{2}-\\d{2}:\\d{2})?)*$",
            message = "availableDays must be comma-separated day codes (MON-SUN), optionally with :HH:MM-HH:MM ranges"
    )
    @Size(max = 500, message = "availableDays must be at most 500 characters")
    private String availableDays;

    @Size(max = 500, message = "imageUrl must be at most 500 characters")
    @Pattern(
            regexp = "^$|^(https?://|/).+",
            message = "imageUrl must be an absolute http(s) URL or start with '/'"
    )
    private String imageUrl;

    @JsonIgnore
    @AssertTrue(message = "availabilityStart and availabilityEnd must both be provided and start must be before end")
    public boolean isAvailabilityWindowValid() {
        if (availabilityStart == null && availabilityEnd == null) return true;
        if (availabilityStart == null || availabilityEnd == null) return false;
        return availabilityStart.isBefore(availabilityEnd);
    }
}
