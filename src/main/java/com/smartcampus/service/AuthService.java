package com.smartcampus.service;

import com.smartcampus.models.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Set;

import java.util.Optional;

/**
 * AuthService – Business logic for authentication and user management.
 *
 * Responsibilities:
 *   - Expose the currently authenticated user as a domain object
 *   - Provide admin-level role management (assign / revoke roles)
 *   - Utility methods used by AuthController
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    // ── Manual Authentication ──────────────────────────────────────────────────

    /**
     * Register a new user with a password.
     */
    public User register(String name, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .provider("LOCAL")
                .roles(Set.of(User.Role.USER))
                .build();

        return userRepository.save(user);
    }

    /**
     * Authenticate a user by email and password.
     */
    public String authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return jwtTokenProvider.generateToken(user);
    }

    // ── User Retrieval ────────────────────────────────────────────────────────

    /**
     * Find a User by their email address.
     * Used to fetch the current user's profile from the JWT subject claim.
     *
     * @param email the user's email
     * @return an Optional containing the User if found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find a User by their MongoDB document ID.
     *
     * @param id the MongoDB _id string
     * @return an Optional containing the User if found
     */
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    // ── Role Management (ADMIN only) ──────────────────────────────────────────

    /**
     * Add a role to an existing user's role set.
     * This method should only be called from an ADMIN-protected endpoint.
     *
     * @param userId the target user's MongoDB _id
     * @param role   the role to assign
     * @return the updated User document
     * @throws IllegalArgumentException if the user is not found
     */
    public User addRole(String userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.getRoles().add(role);
        User saved = userRepository.save(user);
        log.info("ADMIN: added role {} to user {}", role, user.getEmail());
        return saved;
    }

    /**
     * Remove a role from a user's role set.
     * Guards against removing the last role to prevent lockout.
     *
     * @param userId the target user's MongoDB _id
     * @param role   the role to remove
     * @return the updated User document
     */
    public User removeRole(String userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.getRoles().size() <= 1) {
            throw new IllegalStateException("Cannot remove the last role from a user.");
        }

        user.getRoles().remove(role);
        User saved = userRepository.save(user);
        log.info("ADMIN: removed role {} from user {}", role, user.getEmail());
        return saved;
    }

    // ── Token Generation ──────────────────────────────────────────────────────

    /**
     * Generate a fresh JWT for a given email.
     * Used if a client needs to refresh its token.
     *
     * @param email the user's email
     * @return signed JWT string
     */
    public String generateTokenForEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return jwtTokenProvider.generateToken(user);
        /**
     * Update user profile details and return a new JWT.
     */
    public String updateProfile(String email, String newName, String newImageUrl, String phone, String department, String bio) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (newName != null && !newName.isBlank()) user.setName(newName);
        if (newImageUrl != null) user.setImageUrl(newImageUrl);
        if (phone != null) user.setPhone(phone);
        if (department != null) user.setDepartment(department);
        if (bio != null) user.setBio(bio);

        userRepository.save(user);
        return jwtTokenProvider.generateToken(user);
    }
}
