package com.lms.assessment.dto.ticket;

import com.lms.assessment.model.ticket.Priority;
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
public class UpdateTicketRequest {

    @Size(max = 255, message = "Location must be at most 255 characters")
    private String location;

    @Size(max = 255, message = "Category must be at most 255 characters")
    private String category;

    @Size(max = 4000, message = "Description must be at most 4000 characters")
    private String description;

    private Priority priority;

    @Size(max = 2000, message = "Contact details must be at most 2000 characters")
    private String contactDetails;

    // Optional multipart upload support for new attachments
    @Size(max = 3, message = "A maximum of 3 files is allowed")
    private List<MultipartFile> files;
    
    @Size(max = 3, message = "A ticket can have at most 3 attachments")
    private List<@Size(max = 1000) String> attachmentPaths;
}
