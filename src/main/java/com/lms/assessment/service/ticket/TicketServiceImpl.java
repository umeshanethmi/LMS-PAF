package com.lms.assessment.service.ticket;

import com.lms.assessment.dto.ticket.*;
import lombok.extern.slf4j.Slf4j;
import com.lms.assessment.exception.ForbiddenOperationException;
import com.lms.assessment.exception.ResourceNotFoundException;
import com.lms.assessment.exception.SubmissionException;
import com.lms.assessment.model.ticket.*;
import com.lms.assessment.model.user.User;
import com.lms.assessment.repository.user.UserRepository;
import com.lms.assessment.repository.ticket.TicketAttachmentRepository;
import com.lms.assessment.repository.ticket.TicketRepository;
import com.lms.assessment.service.FileStorageService;
import com.lms.assessment.service.email.EmailService;
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
@Slf4j
public class TicketServiceImpl implements TicketService {

    private static final String TICKET_UPLOAD_SUBDIR = "tickets";
    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;

    public TicketServiceImpl(TicketRepository ticketRepository,
                             TicketAttachmentRepository attachmentRepository,
                             UserRepository userRepository,
                             FileStorageService fileStorageService,
                             EmailService emailService) {
        this.ticketRepository = ticketRepository;
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.emailService = emailService;
    }

    @Override
    public TicketResponse createTicket(CreateTicketRequest request) {
        String email = request.getEmail();
        if (email == null) {
            throw new SubmissionException("Email is required.");
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
                .email(email)
                .reporterUserId(request.getCurrentUserId())
                .location(request.getLocation())
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .contactDetails(contactDetails)
                .status(TicketStatus.OPEN)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        addUploadedAttachments(saved, files);
        addPathAttachments(saved, attachmentPaths);

        // Send confirmation email
        sendConfirmationEmail(saved);

        return mapToTicketResponse(saved, true);
    }

    private void sendConfirmationEmail(Ticket ticket) {
        String subject = "Incident Reported: " + ticket.getId();
        String htmlBody = String.format(
            "<html><body>" +
            "<h2>Incident Report Confirmation</h2>" +
            "<p>Dear User,</p>" +
            "<p>Your incident has been successfully reported. Our team will look into it shortly.</p>" +
            "<p><b>Ticket ID:</b> %s</p>" +
            "<p><b>Category:</b> %s</p>" +
            "<p><b>Location:</b> %s</p>" +
            "<p><b>Priority:</b> %s</p>" +
            "<p><b>Description:</b> %s</p>" +
            "<br>" +
            "<p>Regards,<br>UniFlex Hub Support</p>" +
            "</body></html>",
            ticket.getId(), ticket.getCategory(), ticket.getLocation(), ticket.getPriority(), ticket.getDescription()
        );

        emailService.sendHtmlEmail(ticket.getEmail(), subject, htmlBody);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets(String currentUserId, TicketActorRole actorRole) {
        List<Ticket> tickets;
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");

        if (actorRole == TicketActorRole.ADMIN) {
            tickets = ticketRepository.findAll(sort);
        } else {
            // Check the authentic role of the user in the database
            User currentUser = null;
            if (currentUserId != null && !currentUserId.isBlank() && !"0".equals(currentUserId)) {
                currentUser = userRepository.findById(currentUserId).orElse(null);
            }

            // If the authentic user is an ADMIN, they should see everything even when simulating
            if (currentUser != null && currentUser.getRole() == User.Role.ADMIN) {
                tickets = ticketRepository.findAll(sort);
            } else if (actorRole == TicketActorRole.TECHNICIAN) {
                // Real Technicians only see their assigned tickets
                tickets = ticketRepository.findByAssignedTechnicianId(currentUserId, sort);
            } else {
                // Real Users only see their reported tickets
                if (currentUserId == null || currentUserId.isBlank()) {
                    return new java.util.ArrayList<>();
                }
                tickets = ticketRepository.findByReporterUserId(currentUserId, sort);
            }
        }

        return tickets.stream()
                .map(ticket -> mapToTicketResponse(ticket, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));
        return mapToTicketResponse(ticket, true);
    }

    @Override
    public TicketResponse updateTicket(String ticketId, UpdateTicketRequest request, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!Objects.equals(ticket.getReporterUserId(), currentUserId)) {
            throw new ForbiddenOperationException("Only the reporter can update this ticket.");
        }

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            ticket.setCategory(request.getCategory());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            ticket.setDescription(request.getDescription());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            ticket.setLocation(request.getLocation());
        }
        if (request.getPriority() != null) {
            ticket.setPriority(request.getPriority());
        }
        if (request.getContactDetails() != null && !request.getContactDetails().isBlank()) {
            ticket.setContactDetails(request.getContactDetails());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        
        List<MultipartFile> files = request.getFiles() == null ? Collections.emptyList() : request.getFiles();
        List<String> attachmentPaths = request.getAttachmentPaths() == null ? Collections.emptyList() : request.getAttachmentPaths();
        
        int currentAttachmentCount = attachmentRepository.findByTicketId(ticketId).size();
        int newAttachmentsCount = countProvidedAttachments(files, attachmentPaths);
        
        if (currentAttachmentCount + newAttachmentsCount > MAX_ATTACHMENTS_PER_TICKET) {
            throw new SubmissionException("A maximum of " + MAX_ATTACHMENTS_PER_TICKET + " attachments is allowed per ticket.");
        }

        Ticket saved = ticketRepository.save(ticket);
        addUploadedAttachments(saved, files);
        addPathAttachments(saved, attachmentPaths);

        return mapToTicketResponse(saved, true);
    }

    @Override
    public void deleteTicket(String ticketId, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!Objects.equals(ticket.getReporterUserId(), currentUserId)) {
            throw new ForbiddenOperationException("Only the reporter can delete this ticket.");
        }

        // Delete associated attachments
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        attachmentRepository.deleteAll(attachments);

        // Delete ticket
        ticketRepository.delete(ticket);
    }

    @Override
    public TicketResponse assignTechnician(String ticketId, AssignTechnicianRequest request, String currentUserId,
                                           TicketActorRole actorRole) {
        requireRole(actorRole, TicketActorRole.ADMIN, "Only administrators can assign technicians.");

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new SubmissionException("Closed or rejected tickets cannot be reassigned.");
        }

        ticket.setAssignedTechnicianId(request.getTechnicianId());
        ticket.setStatus(TicketStatus.ASSIGNED);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        Ticket updated = ticketRepository.save(ticket);

        // Notify user via Email
        try {
            String subject = "Technician Assigned: Ticket #" + ticket.getId();
            String body = "<h3>Technician Assigned</h3>" +
                         "<p>An expert has been assigned to your maintenance request.</p>" +
                         "<p><b>Ticket ID:</b> " + ticket.getId() + "</p>" +
                         "<p><b>Status:</b> ASSIGNED</p>" +
                         "<p>Work will begin shortly.</p>";
            emailService.sendHtmlEmail(ticket.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Notification failed: " + e.getMessage());
        }

        return mapToTicketResponse(updated, true);
    }

    @Override
    public TicketResponse dispatchTicket(String ticketId, String technicianId, String requestingUserId) {
        // 1. Validation Logic
        User adminUser = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", requestingUserId));
        
        if (adminUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenOperationException("Access Denied: Only administrators can dispatch tickets.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        // 2. Data Update
        ticket.setAssignedTechnicianId(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setDispatchedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);

        // 3. Email Notification to Technician
        User tech = userRepository.findById(technicianId).orElse(null);
        if (tech != null && tech.getEmail() != null) {
            try {
                String subject = "New Mission Assigned: Ticket #" + ticket.getId();
                String body = "<h3>New Assignment Received</h3>" +
                             "<p>Hello " + tech.getUsername() + ",</p>" +
                             "<p>You have been dispatched to handle a new incident.</p>" +
                             "<p><b>Ticket ID:</b> " + ticket.getId() + "</p>" +
                             "<p><b>Location:</b> " + ticket.getLocation() + "</p>" +
                             "<p><b>Category:</b> " + ticket.getCategory() + "</p>" +
                             "<p><b>Priority:</b> " + ticket.getPriority() + "</p>" +
                             "<br><p>Log in to the CampusHub Tech Portal to begin work.</p>";
                emailService.sendHtmlEmail(tech.getEmail(), subject, body);
            } catch (Exception e) {
                log.error("Failed to notify technician via email: {}", e.getMessage());
            }
        }

        return mapToTicketResponse(saved, true);
    }

    @Override
    public TicketResponse resolveTicket(String ticketId, String technicianId, String notes) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!Objects.equals(ticket.getAssignedTechnicianId(), technicianId)) {
            throw new ForbiddenOperationException("Only the assigned technician can resolve this ticket.");
        }

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new SubmissionException("Only tickets currently IN_PROGRESS can be resolved.");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(notes);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToTicketResponse(ticketRepository.save(ticket), true);
    }

    @Override
    public TicketResponse submitFeedback(String ticketId, Integer rating, String comment, String studentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (!Objects.equals(ticket.getReporterUserId(), studentId)) {
            throw new ForbiddenOperationException("Only the original reporter can provide feedback.");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new SubmissionException("Feedback can only be provided for RESOLVED tickets.");
        }

        ticket.setRating(rating);
        ticket.setFeedbackComment(comment);
        ticket.setStatus(TicketStatus.CLOSED);
        ticket.setClosedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        return mapToTicketResponse(ticketRepository.save(ticket), true);
    }

    @Override
    public TicketResponse updateTicketStatus(String ticketId, UpdateTicketStatusRequest request,
                                             String currentUserId, TicketActorRole actorRole) {
        requireRole(actorRole, TicketActorRole.TECHNICIAN, "Only technicians can update ticket status.");

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getAssignedTechnicianId() == null) {
            throw new SubmissionException("Ticket must be assigned to a technician before its status can be updated.");
        }

        if (!Objects.equals(ticket.getAssignedTechnicianId(), currentUserId)) {
            throw new ForbiddenOperationException("Only the assigned technician can update this ticket.");
        }

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getNewStatus();

        if (newStatus == null) {
            throw new SubmissionException("New status must be provided.");
        }

        // Special check for REJECTED status
        if (newStatus == TicketStatus.REJECTED) {
            if (actorRole != TicketActorRole.ADMIN) {
                throw new ForbiddenOperationException("Only an ADMIN can reject a ticket.");
            }
            if (currentStatus != TicketStatus.OPEN) {
                throw new SubmissionException("Only OPEN tickets can be rejected.");
            }
            if (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank()) {
                throw new SubmissionException("A rejection reason is mandatory.");
            }
        } else {
            // Standard workflow check
            if (!isValidStatusTransition(currentStatus, newStatus)) {
                throw new SubmissionException("Invalid status transition from " + currentStatus + " to " + newStatus + ". Workflow must strictly follow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED.");
            }

            if ((newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED)
                    && (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank())) {
                throw new SubmissionException("Resolution notes are required when resolving or closing a ticket.");
            }
        }

        ticket.setStatus(request.getNewStatus());
        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updated = ticketRepository.save(ticket);

        // Notify user via Email
        try {
            String subject = "Status Update: Ticket #" + ticket.getId();
            String body = "<h3>Ticket Status Updated</h3>" +
                         "<p>The status of your maintenance request has changed.</p>" +
                         "<p><b>Ticket ID:</b> " + ticket.getId() + "</p>" +
                         "<p><b>New Status:</b> " + updated.getStatus() + "</p>";
            
            if (updated.getResolutionNotes() != null) {
                body += "<p><b>Notes:</b> " + updated.getResolutionNotes() + "</p>";
            }
            
            emailService.sendHtmlEmail(ticket.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Notification failed: " + e.getMessage());
        }

        return mapToTicketResponse(updated, true);
    }

    @Override
    public List<TicketResponse> getTicketsByTechnician(String technicianId) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        List<Ticket> tickets = ticketRepository.findByAssignedTechnicianId(technicianId, sort);
        
        // Ensure we return a clean JSON array even if empty
        if (tickets == null) return new java.util.ArrayList<>();
        
        return tickets.stream()
                .map(t -> mapToTicketResponse(t, false))
                .collect(Collectors.toList());
    }

    @Override
    public TicketCommentResponse addComment(String ticketId, CreateCommentRequest request, String currentUserId, TicketActorRole role) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        String authorName = role == TicketActorRole.ADMIN ? "Guest Admin" : 
                           role == TicketActorRole.TECHNICIAN ? "Guest Technician" : "Guest Student";
        TicketActorRole authorRole = role;

        // If frontend provided metadata, use it (useful for simulated/guest states)
        if (request.getSenderName() != null && !request.getSenderName().isBlank()) {
            authorName = request.getSenderName();
        }
        if (request.getSenderRole() != null && !request.getSenderRole().isBlank()) {
            try {
                authorRole = TicketActorRole.valueOf(request.getSenderRole().toUpperCase());
            } catch (Exception ignored) {}
        }

        // If we have a real user ID, override with database data for security
        if (!"0".equals(currentUserId)) {
            User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));
            authorName = currentUser.getUsername();
            authorRole = TicketActorRole.valueOf(currentUser.getRole().name());
        }

        validateCommentAccess(ticket, currentUserId, authorRole);

        TicketComment comment = TicketComment.builder()
                .id(java.util.UUID.randomUUID().toString())
                .ticketId(ticket.getId())
                .authorUserId(currentUserId)
                .author(authorName)
                .authorRole(authorRole)
                .message(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        ticket.getComments().add(comment);
        ticketRepository.save(ticket);
        
        return mapToCommentResponse(comment);
    }

    @Override
    public TicketCommentResponse updateComment(String ticketId, String commentId, UpdateCommentRequest request, String currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketComment comment = ticket.getComments().stream()
                .filter(c -> Objects.equals(c.getId(), commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("TicketComment", "id", commentId));

        if (!Objects.equals(comment.getAuthorUserId(), currentUserId)) {
            throw new ForbiddenOperationException("You are not allowed to edit this comment.");
        }

        comment.setMessage(request.getContent());
        ticketRepository.save(ticket);
        
        return mapToCommentResponse(comment);
    }

    @Override
    public void deleteComment(String ticketId, String commentId, String currentUserId, TicketActorRole actorRole) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketComment commentToRemove = ticket.getComments().stream()
                .filter(c -> Objects.equals(c.getId(), commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("TicketComment", "id", commentId));

        boolean isOwner = Objects.equals(commentToRemove.getAuthorUserId(), currentUserId);
        boolean isAdmin = actorRole == TicketActorRole.ADMIN;
        
        if (!isOwner && !isAdmin) {
            throw new ForbiddenOperationException("Access Denied: You are not authorized to delete this comment.");
        }

        ticket.getComments().remove(commentToRemove);
        ticketRepository.save(ticket);
    }

    private void addUploadedAttachments(Ticket ticket, List<MultipartFile> files) {
        List<TicketAttachment> attachments = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            validateImageFile(file);
            String storedPath = fileStorageService.storeFile(file, TICKET_UPLOAD_SUBDIR);
            attachments.add(TicketAttachment.builder()
                    .ticketId(ticket.getId())
                    .filePath(storedPath)
                    .imagePath(storedPath)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        if (!attachments.isEmpty()) {
            attachmentRepository.saveAll(attachments);
        }
    }

    private void addPathAttachments(Ticket ticket, List<String> attachmentPaths) {
        List<TicketAttachment> attachments = new java.util.ArrayList<>();
        for (String attachmentPath : attachmentPaths) {
            if (attachmentPath == null || attachmentPath.isBlank()) {
                continue;
            }

            attachments.add(TicketAttachment.builder()
                    .ticketId(ticket.getId())
                    .filePath(attachmentPath.trim())
                    .imagePath(attachmentPath.trim())
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        if (!attachments.isEmpty()) {
            attachmentRepository.saveAll(attachments);
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

        switch (current) {
            case OPEN:
                return target == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS:
                return target == TicketStatus.RESOLVED;
            case RESOLVED:
                return target == TicketStatus.CLOSED;
            default:
                return false;
        }
    }

    private TicketResponse mapToTicketResponse(Ticket ticket, boolean includeChildren) {
        List<TicketAttachmentResponse> attachmentResponses = Collections.emptyList();
        List<TicketCommentResponse> commentResponses = Collections.emptyList();

        if (includeChildren) {
            attachmentResponses = attachmentRepository.findByTicketId(ticket.getId()).stream()
                    .map(this::mapToAttachmentResponse)
                    .collect(Collectors.toList());

            if (ticket.getComments() != null) {
                commentResponses = ticket.getComments().stream()
                        .map(this::mapToCommentResponse)
                        .collect(Collectors.toList());
            }
        }

        String techName = null;
        if (ticket.getAssignedTechnicianId() != null) {
            techName = userRepository.findById(ticket.getAssignedTechnicianId())
                .map(User::getUsername)
                .orElse("Expert #" + ticket.getAssignedTechnicianId());
            
            // Special case for guest system
            if ("0".equals(ticket.getAssignedTechnicianId())) {
                techName = "Guest System";
            }
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .email(ticket.getEmail())
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .preferredContact(ticket.getContactDetails())
                .reporterUserId(ticket.getReporterUserId())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .assignedTechnicianName(techName)
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .dispatchedAt(ticket.getDispatchedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .rating(ticket.getRating())
                .feedbackComment(ticket.getFeedbackComment())
                .attachments(attachmentResponses)
                .comments(commentResponses)
                .build();
    }

    private TicketAttachmentResponse mapToAttachmentResponse(TicketAttachment attachment) {
        String fileName = attachment.getImagePath();
        String fileUrl = fileName;
        
        if (fileName != null && !fileName.startsWith("http")) {
            fileUrl = "http://localhost:8084/api/tickets/attachments/" + fileName;
        }

        return TicketAttachmentResponse.builder()
                .id(attachment.getId())
                .imagePath(fileName)
                .fileUrl(fileUrl)
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    private TicketCommentResponse mapToCommentResponse(TicketComment comment) {
        TicketActorRole responseRole = comment.getAuthorRole();
        if (responseRole == null) {
            if ("0".equals(comment.getAuthorUserId())) {
                // Determine role from name for legacy/simulated guest comments
                String author = comment.getAuthor();
                if (author != null) {
                    if (author.contains("Admin")) responseRole = TicketActorRole.ADMIN;
                    else if (author.contains("Technician")) responseRole = TicketActorRole.TECHNICIAN;
                    else responseRole = TicketActorRole.USER;
                }
            } else if (comment.getAuthorUserId() != null) {
                responseRole = userRepository.findById(comment.getAuthorUserId())
                    .map(user -> TicketActorRole.valueOf(user.getRole().name()))
                    .orElse(TicketActorRole.USER);
            }
        }

        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .userId(comment.getAuthorUserId())
                .authorUserId(comment.getAuthorUserId())
                .author(comment.getAuthor())
            .authorRole(responseRole == null ? null : responseRole.name())
                .content(comment.getMessage())
                .timestamp(comment.getCreatedAt())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private void validateCommentAccess(Ticket ticket, String currentUserId, TicketActorRole authorRole) {
        // Allow Admins and Technicians to always comment
        // Allow the original reporter to comment even before technician assignment
        boolean isReporter = Objects.equals(ticket.getReporterUserId(), currentUserId);
        boolean isStaff = authorRole == TicketActorRole.ADMIN || authorRole == TicketActorRole.TECHNICIAN;

        if (!isReporter && !isStaff) {
            throw new ForbiddenOperationException("Access Denied: You are not authorized to comment on this ticket.");
        }
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

    @Override
    public TicketResponse startWork(String ticketId, String techId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getStatus() != TicketStatus.ASSIGNED) {
            throw new SubmissionException("Work can only be started on tickets that are currently ASSIGNED. Current status: " + ticket.getStatus());
        }

        if (!Objects.equals(ticket.getAssignedTechnicianId(), techId)) {
             // In a real system we would check roles here too
             throw new ForbiddenOperationException("Only the assigned technician can start work on this ticket.");
        }

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updated = ticketRepository.save(ticket);
        
        // Notify user via Email
        try {
            String subject = "Work Started: Ticket #" + ticket.getId();
            String body = "<h3>Work In Progress</h3>" +
                         "<p>A technician has officially started working on your request.</p>" +
                         "<p><b>Ticket ID:</b> " + ticket.getId() + "</p>" +
                         "<p><b>Status:</b> IN_PROGRESS</p>";
            emailService.sendHtmlEmail(ticket.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Notification failed: " + e.getMessage());
        }

        return mapToTicketResponse(updated, true);
    }
}
