package com.lms.assessment.model.campus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "campus_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampusResource {

    @Id
    private String id;

    /** Room/resource code, e.g. A101, B204, F305, G102 */
    @Indexed(unique = true)
    private String code;

    private String name;

    private ResourceType type;

    /** Seating / equipment capacity */
    @Builder.Default
    private int capacity = 1;

    /** Optional floor number */
    private Integer floor;

    /** Optional description */
    private String description;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum ResourceType {
        HALL, LAB, EQUIPMENT
    }

    /**
     * Derive building from room code prefix:
     * A/B -&gt; Main Building, F/G -&gt; New Building
     */
    public String getBuilding() {
        if (code == null || code.isBlank()) return "Unknown";
        char prefix = Character.toUpperCase(code.charAt(0));
        if (prefix == 'A' || prefix == 'B') return "Main Building";
        if (prefix == 'F' || prefix == 'G') return "New Building";
        return "Other";
    }
}
