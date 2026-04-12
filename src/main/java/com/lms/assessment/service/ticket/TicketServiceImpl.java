package com.lms.assessment.service.ticket;

import com.lms.assessment.dto.ticket.*;
import com.lms.assessment.exception.ForbiddenOperationException;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.ticket.*;
import com.lms.assessment.repository.ticket.TicketCommentRepository;
import com.lms.assessment.repository.ticket.TicketRepository;
import com.lms.assessment.service.FileStorageService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    private static final String TICKET_UPLOAD_SUBDIR = "tickets";
    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final FileStorageService fileStorageService;

    public TicketServiceImpl(TicketRepository ticketRepository,
                             TicketCommentRepository commentRepository,
                             FileStorageService fileStorageService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public TicketResponse createTicket(CreateTicketRequest request) {
        String resourceId = firstNonBlank(request.getResourceId(), request.getTitle());
        if (resourceId == null) {
            throw new SubmissionException("Resource ID is required.");
        }

        String contactDetails = firstNonBlank(request.getContactDetails(), request.getPreferredContact());
        if (contactDetails == null) {
            throw new SubmissionException("Contact details are required.");
        }

        List<MultipartFile> files = request.getFiles() == null ? Collections.emptyList() : request.getFiles();
        List<String> attachmentPaths = request.getAttachmentPaths() == null
                ? Collections.emptyList()
                : request.getAttachmentPaths();

        int totalAttachments = countProvidedAttachments(files, attachmentPaths);
        if (totalAttachments > MAX_ATTACHMENTS_PER_TICKET) {
            throw new SubmissionException("A maximum of " + MAX_ATTACHMENTS_PER_TICKET + " attachments is allowed per ticket.");
        }

        Ticket ticket = Ticket.builder()
                .resourceId(resourceId)
                .location(request.getLocation())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .contactDetails(contactDetails)
                .status(TicketStatus.OPEN)
                .build();

        addUploadedAttachments(ticket, files);
        addPathAttachments(ticket, attachmentPaths);

        Ticket saved = ticketRepository.save(ticket);
        return mapToTicketResponse(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(ticket -> mapToTicketResponse(ticket, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));
        return mapToTicketResponse(ticket, true);
    }

    @Override
    public TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request, Long currentUserId,
                                           TicketActorRole actorRole) {
        requireRole(actorRole, TicketActorRole.ADMIN, "Only administrators can assign technicians.");

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new SubmissionException("Closed or rejected tickets cannot be reassigned.");
        }

        ticket.setAssignedTechnicianId(request.getTechnicianId());
        Ticket updated = ticketRepository.save(ticket);
        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request,
                                             Long currentUserId, TicketActorRole actorRole) {
        requireRole(actorRole, TicketActorRole.TECHNICIAN, "Only technicians can update ticket status.");

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getAssignedTechnicianId() == null) {
            throw new SubmissionException("Ticket must be assigned to a technician before its status can be updated.");
        }

        if (!Objects.equals(ticket.getAssignedTechnicianId(), String.valueOf(currentUserId))) {
            throw new ForbiddenOperationException("Only the assigned technician can update this ticket.");
        }

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getNewStatus();

        if (newStatus == null) {
            throw new SubmissionException("New status must be provided.");
        }

        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new SubmissionException("Invalid status transition from " + currentStatus + " to " + newStatus + ".");
        }

        String resolutionNotes = request.getResolutionNotes();
        if ((newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED)
                && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new SubmissionException("Resolution notes are required when resolving or closing a ticket.");
        }

        ticket.setStatus(newStatus);
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }

        Ticket updated = ticketRepository.save(ticket);
        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketCommentResponse addComment(Long ticketId, CreateCommentRequest request, Long currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .userId(currentUserId)
                .author("Staff") // Default for now
                .message(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        TicketComment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved);
    }

    @Override
    public void deleteComment(Long ticketId, Long commentId, Long currentUserId, TicketActorRole actorRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketComment", "id", commentId));

        if (!Objects.equals(comment.getTicket().getId(), ticket.getId())) {
            throw new SubmissionException("Comment does not belong to the specified ticket.");
        }

        boolean isOwner = Objects.equals(comment.getUserId(), currentUserId);
        boolean isPrivilegedRole = actorRole == TicketActorRole.ADMIN || actorRole == TicketActorRole.TECHNICIAN;
        if (!isOwner && !isPrivilegedRole) {
            throw new ForbiddenOperationException("You are not allowed to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    private void addUploadedAttachments(Ticket ticket, List<MultipartFile> files) {
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            validateImageFile(file);
            String storedPath = fileStorageService.storeFile(file, TICKET_UPLOAD_SUBDIR);
            ticket.getAttachments().add(TicketAttachment.builder()
                    .ticket(ticket)
                    .imagePath(storedPath)
                    .build());
        }
    }

    private void addPathAttachments(Ticket ticket, List<String> attachmentPaths) {
        for (String attachmentPath : attachmentPaths) {
            if (attachmentPath == null || attachmentPath.isBlank()) {
                continue;
            }

            ticket.getAttachments().add(TicketAttachment.builder()
                    .ticket(ticket)
                    .imagePath(attachmentPath.trim())
                    .build());
        }
    }

    private int countProvidedAttachments(List<MultipartFile> files, List<String> attachmentPaths) {
        int fileCount = 0;
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                fileCount++;
            }
        }

        int pathCount = 0;
        for (String attachmentPath : attachmentPaths) {
            if (attachmentPath != null && !attachmentPath.isBlank()) {
                pathCount++;
            }
        }

        return fileCount + pathCount;
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            return;
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new SubmissionException("Only image files are allowed.");
        }

        String lowerName = originalName.toLowerCase(Locale.ROOT);
        if (!(lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")
                || lowerName.endsWith(".webp") || lowerName.endsWith(".gif"))) {
            throw new SubmissionException("Only image files are allowed.");
        }
    }

    private boolean isValidStatusTransition(TicketStatus current, TicketStatus target) {
        if (current == null) {
            return target == TicketStatus.OPEN;
        }

        if (current == TicketStatus.OPEN) {
            return target == TicketStatus.IN_PROGRESS || target == TicketStatus.RESOLVED
                    || target == TicketStatus.CLOSED || target == TicketStatus.REJECTED;
        }
        if (current == TicketStatus.IN_PROGRESS) {
            return target == TicketStatus.RESOLVED || target == TicketStatus.CLOSED || target == TicketStatus.REJECTED;
        }
        if (current == TicketStatus.RESOLVED) {
            return target == TicketStatus.CLOSED;
        }
        return false;
    }

    private TicketResponse mapToTicketResponse(Ticket ticket, boolean includeChildren) {
        List<TicketAttachmentResponse> attachmentResponses = Collections.emptyList();
        List<TicketCommentResponse> commentResponses = Collections.emptyList();

        if (includeChildren) {
            attachmentResponses = ticket.getAttachments().stream()
                    .map(this::mapToAttachmentResponse)
                    .collect(Collectors.toList());

            List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
            commentResponses = comments.stream()
                    .map(this::mapToCommentResponse)
                    .collect(Collectors.toList());
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .resourceId(ticket.getResourceId())
                .title(ticket.getResourceId())
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .preferredContact(ticket.getContactDetails())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .attachments(attachmentResponses)
                .comments(commentResponses)
                .build();
    }

    private TicketAttachmentResponse mapToAttachmentResponse(TicketAttachment attachment) {
        return TicketAttachmentResponse.builder()
                .id(attachment.getId())
                .imagePath(attachment.getImagePath())
                .fileUrl(attachment.getImagePath())
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    private TicketCommentResponse mapToCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .userId(comment.getUserId())
                .authorUserId(comment.getUserId())
                .content(comment.getMessage())
                .timestamp(comment.getCreatedAt())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private void requireRole(TicketActorRole actorRole, TicketActorRole requiredRole, String message) {
        if (actorRole != requiredRole) {
            throw new ForbiddenOperationException(message);
        }
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first.trim();
        }

        if (second != null && !second.isBlank()) {
            return second.trim();
        }

        return null;
    }
}
