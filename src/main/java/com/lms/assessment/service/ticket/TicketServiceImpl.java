package com.lms.assessment.service.ticket;

import com.lms.assessment.dto.ticket.*;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.ticket.*;
import com.lms.assessment.repository.ticket.TicketAttachmentRepository;
import com.lms.assessment.repository.ticket.TicketCommentRepository;
import com.lms.assessment.repository.ticket.TicketRepository;
import com.lms.assessment.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    private static final String TICKET_UPLOAD_SUBDIR = "tickets";
    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketCommentRepository commentRepository;
    private final FileStorageService fileStorageService;

    public TicketServiceImpl(TicketRepository ticketRepository,
                             TicketAttachmentRepository attachmentRepository,
                             TicketCommentRepository commentRepository,
                             FileStorageService fileStorageService) {
        this.ticketRepository = ticketRepository;
        this.attachmentRepository = attachmentRepository;
        this.commentRepository = commentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public TicketResponse createTicket(CreateTicketRequest request, Long currentUserId) {
        List<MultipartFile> files = request.getFiles();
        if (files != null && files.size() > MAX_ATTACHMENTS_PER_TICKET) {
            throw new SubmissionException("A maximum of " + MAX_ATTACHMENTS_PER_TICKET + " attachments is allowed per ticket.");
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .location(request.getLocation())
                .facilityId(request.getFacilityId())
                .preferredContact(request.getPreferredContact())
                .reporterUserId(currentUserId)
                .build();

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                validateImageFile(file);
                String storedPath = fileStorageService.storeFile(file, TICKET_UPLOAD_SUBDIR);
                TicketAttachment attachment = TicketAttachment.builder()
                        .ticket(ticket)
                        .fileName(file.getOriginalFilename())
                        .filePath(storedPath)
                        .build();
                ticket.getAttachments().add(attachment);
            }
        }

        Ticket saved = ticketRepository.save(ticket);
        return mapToTicketResponse(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(Long currentUserId, boolean canViewAll) {
        List<Ticket> tickets;
        if (canViewAll) {
            tickets = ticketRepository.findAll();
        } else {
            tickets = ticketRepository.findByReporterUserId(currentUserId);
        }

        return tickets.stream()
                .map(ticket -> mapToTicketResponse(ticket, true))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketByIdForUser(Long ticketId, Long currentUserId, boolean canViewAll) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!canViewAll && !Objects.equals(ticket.getReporterUserId(), currentUserId)) {
            throw new SubmissionException("You are not allowed to view this ticket.");
        }

        return mapToTicketResponse(ticket, true);
    }

    @Override
    public TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request,
                                             Long currentUserId, boolean isStaffOrAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!isStaffOrAdmin) {
            throw new SubmissionException("Only staff/technicians/admins can update ticket status.");
        }

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getNewStatus();

        if (newStatus == null) {
            throw new SubmissionException("New status must be provided.");
        }

        if (currentStatus == newStatus) {
            // no-op, but still allow updating technician or resolution notes
        } else if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new SubmissionException("Invalid status transition from " + currentStatus + " to " + newStatus + ".");
        }

        // REJECTED is only for staff/admin, but method already gated by isStaffOrAdmin
        ticket.setStatus(newStatus);

        if (request.getTechnicianUserId() != null) {
            ticket.setTechnicianUserId(request.getTechnicianUserId());
        }

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        Ticket updated = ticketRepository.save(ticket);
        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketCommentResponse addComment(Long ticketId, CreateCommentRequest request, Long currentUserId,
                                            boolean canViewAll) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!canViewAll && !Objects.equals(ticket.getReporterUserId(), currentUserId)) {
            throw new SubmissionException("You are not allowed to comment on this ticket.");
        }

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .authorUserId(currentUserId)
                .content(request.getContent())
                .build();

        TicketComment saved = commentRepository.save(comment);
        return mapToCommentResponse(saved);
    }

    @Override
    public void deleteComment(Long ticketId, Long commentId, Long currentUserId, boolean isStaffOrAdmin) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketComment", "id", commentId));

        if (!Objects.equals(comment.getTicket().getId(), ticket.getId())) {
            throw new SubmissionException("Comment does not belong to the specified ticket.");
        }

        boolean isOwner = Objects.equals(comment.getAuthorUserId(), currentUserId);
        if (!isOwner && !isStaffOrAdmin) {
            throw new SubmissionException("You are not allowed to delete this comment.");
        }

        commentRepository.delete(comment);
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && contentType.toLowerCase().startsWith("image/")) {
            return;
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            throw new SubmissionException("Only image files (png, jpg, jpeg) are allowed.");
        }

        String lowerName = originalName.toLowerCase(Locale.ROOT);
        if (!(lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg"))) {
            throw new SubmissionException("Only image files (png, jpg, jpeg) are allowed.");
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
            return target == TicketStatus.CLOSED || target == TicketStatus.REJECTED;
        }
        if (current == TicketStatus.CLOSED || current == TicketStatus.REJECTED) {
            // terminal statuses
            return false;
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
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .location(ticket.getLocation())
                .facilityId(ticket.getFacilityId())
                .preferredContact(ticket.getPreferredContact())
                .reporterUserId(ticket.getReporterUserId())
                .technicianUserId(ticket.getTechnicianUserId())
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
                .fileName(attachment.getFileName())
                // Expose stored path for now; controller can turn this into a full URL
                .fileUrl(attachment.getFilePath())
                .build();
    }

    private TicketCommentResponse mapToCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .authorUserId(comment.getAuthorUserId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
