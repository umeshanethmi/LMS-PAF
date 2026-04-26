package com.smartcampus.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler – Centralises error responses for all REST controllers.
 * Unified for Smart Campus Hub and Assessment Service modules.
 */
@Slf4j
@RestControllerAdvice
public class SmartCampusGlobalExceptionHandler {

    // ── 400 Bad Request – Validation failures (@Valid) ────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field   = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            fieldErrors.put(field, message);
        });

        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Error");
        body.put("message", "One or more fields failed validation");
        body.put("details", fieldErrors);
        body.put("timestamp", Instant.now().toString());

        return ResponseEntity.badRequest().body(body);
    }

    // ── 400 Bad Request – Business rule violations ─────────────────────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage());
    }

    // ── 403 Forbidden – Ownership violations ──────────────────────────────────
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurityException(
            SecurityException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage());
    }

    // ── 403 Forbidden – @PreAuthorize failures ────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access Denied",
                "You do not have permission to perform this action.");
    }

    // ── 413 Payload Too Large ────────────────────────────────────────────────
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.PAYLOAD_TOO_LARGE, "File Too Large", "File size exceeds the configured maximum limit.");
    }

    // ── Assessment Service Specific Exceptions (Catch by name if class not imported) ──
    @ExceptionHandler({
            com.lms.assessment.exception.ResourceNotFoundException.class,
            com.lms.assessment.exception.MyFileNotFoundException.class
    })
    public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Resource Not Found", ex.getMessage());
    }

    @ExceptionHandler(com.lms.assessment.exception.SubmissionException.class)
    public ResponseEntity<Map<String, Object>> handleSubmissionException(Exception ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Submission Error", ex.getMessage());
    }

    @ExceptionHandler(com.lms.assessment.exception.FileStorageException.class)
    public ResponseEntity<Map<String, Object>> handleFileStorageException(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "File Storage Error", ex.getMessage());
    }

    @ExceptionHandler(com.lms.assessment.exception.ForbiddenOperationException.class)
    public ResponseEntity<Map<String, Object>> handleForbiddenOperation(Exception ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden Operation", ex.getMessage());
    }

    // ── 500 Internal Server Error – Unexpected ────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred.");
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status,
                                                               String error,
                                                               String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status",    status.value());
        body.put("error",     error);
        body.put("message",   message);
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.status(status).body(body);
    }
}
