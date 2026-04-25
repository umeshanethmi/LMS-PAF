package com.smartcampus.controller;

import com.smartcampus.models.User;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController – Endpoints for user identity and admin role management.
 *
 * Base path: /api/auth
 *
 * Endpoints:
 *   GET  /api/auth/me              – return the current logged-in user's profile
 *   POST /api/auth/roles/{userId}  – assign a role (ADMIN only)
 *   DELETE /api/auth/roles/{userId} – remove a role (ADMIN only)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ── GET /api/auth/me ──────────────────────────────────────────────────────

    /**
     * Returns the full profile of the currently authenticated user.
     *
     * The JWT filter populates the SecurityContext; we use @AuthenticationPrincipal
     * to obtain the UserDetails (email as username), then load from MongoDB.
     *
     * @param userDetails Spring Security principal injected by the framework
     * @return 200 with User body, or 404 if somehow not found
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return authService.findByEmail(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── POST /api/auth/roles/{userId} ─────────────────────────────────────────

    /**
     * Assign a role to a user.
     * Only users with the ADMIN role can call this endpoint.
     *
     * Request body: { "role": "TECHNICIAN" }
     *
     * @param userId target user's MongoDB _id
     * @param body   JSON body containing the "role" key
     * @return 200 with the updated User
     */
    @PostMapping("/roles/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> addRole(@PathVariable String userId,
                                        @RequestBody Map<String, String> body) {
        User.Role role = User.Role.valueOf(body.get("role").toUpperCase());
        User updated = authService.addRole(userId, role);
        return ResponseEntity.ok(updated);
    }

    // ── DELETE /api/auth/roles/{userId} ──────────────────────────────────────

    /**
     * Remove a role from a user.
     * Only ADMIN can call this endpoint.
     *
     * Request body: { "role": "TECHNICIAN" }
     *
     * @param userId target user's MongoDB _id
     * @param body   JSON body containing the "role" key
     * @return 200 with the updated User
     */
    @DeleteMapping("/roles/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> removeRole(@PathVariable String userId,
                                           @RequestBody Map<String, String> body) {
        User.Role role = User.Role.valueOf(body.get("role").toUpperCase());
        User updated = authService.removeRole(userId, role);
        return ResponseEntity.ok(updated);
    }
}
