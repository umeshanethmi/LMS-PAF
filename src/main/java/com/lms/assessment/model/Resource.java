package com.lms.assessment.model;

import com.lms.assessment.model.enums.ResourceStatus;
import com.lms.assessment.model.enums.ResourceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id;

    @NotBlank
    @Size(max = 120)
    private String name;

    @NotNull
    @Indexed
    private ResourceType type;

    @Min(1)
    @Max(10_000)
    private Integer capacity;

    @NotBlank
    @Size(max = 200)
    private String location;

    @Size(max = 2000)
    private String description;

    @NotNull
    @Indexed
    private ResourceStatus status;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    @Size(max = 500)
    private String availableDays;

    @Size(max = 500)
    private String imageUrl;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
