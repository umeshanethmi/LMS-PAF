package com.lms.assessment.dto.campus;

import com.lms.assessment.model.campus.CampusResource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampusResourceResponse {

    private String id;
    private String code;
    private String name;
    private CampusResource.ResourceType type;
    private int capacity;
    private Integer floor;
    private String description;
    private String building;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CampusResourceResponse from(CampusResource r) {
        return CampusResourceResponse.builder()
                .id(r.getId())
                .code(r.getCode())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .floor(r.getFloor())
                .description(r.getDescription())
                .building(r.getBuilding())
                .active(r.isActive())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
