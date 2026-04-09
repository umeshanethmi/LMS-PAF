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

    @Size(max = 255, message = "Resource ID must be at most 255 characters")
    private String resourceId;

    @Size(max = 255, message = "Legacy title must be at most 255 characters")
    private String title;

    @NotBlank(message = "Location is required")
    @Size(max = 255, message = "Location must be at most 255 characters")
    private String location;

    @NotBlank(message = "Category is required")
    @Size(max = 255, message = "Category must be at most 255 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 4000, message = "Description must be at most 4000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @Size(max = 2000, message = "Contact details must be at most 2000 characters")
    private String contactDetails;

    @Size(max = 2000, message = "Legacy preferred contact must be at most 2000 characters")
    private String preferredContact;

    @Size(max = 3, message = "A ticket can have at most 3 attachments")
    private List<@Size(max = 1000, message = "Attachment path must be at most 1000 characters") String> attachmentPaths;

    // Optional multipart upload support for client compatibility.
    private List<MultipartFile> files;
}
