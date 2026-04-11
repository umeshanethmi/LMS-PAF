package com.lms.assessment.model.ticket;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resourceId;
    private String description;
    private String category;
    private String priority;
    private String location;
    private String contactDetails;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String assignedTechnicianId;

    @ElementCollection
    private List<String> attachmentPaths;

    @OneToMany(mappedBy = "maintenanceTicket", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<TicketComment> comments = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
}
