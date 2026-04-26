package com.lms.assessment.dto.campus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingChatResponse {

    /** Human-readable reply shown in the chat UI */
    private String reply;

    /** Structured list of suggested slots */
    private List<SlotSuggestion> suggestions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotSuggestion {
        private String resourceId;
        private String resourceCode;
        private String resourceName;
        private String building;
        private String startTime;
        private String endTime;
        private int availableHours;
        private int capacity;
        /** Human-readable reason for this suggestion */
        private String note;
    }
}
