package com.lms.assessment.dto.ticket;

import com.lms.assessment.model.ticket.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be at most 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 4000, message = "Description must be at most 4000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 255, message = "Category must be at most 255 characters")
    private String category;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @Size(max = 255, message = "Location must be at most 255 characters")
    private String location;

    private Long facilityId;

    @Size(max = 255, message = "Preferred contact must be at most 255 characters")
    private String preferredContact;

    // Files will be bound from multipart requests (e.g., name="files")
    private List<MultipartFile> files;
}
