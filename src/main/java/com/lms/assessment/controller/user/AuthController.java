package com.lms.assessment.controller.user;

import com.lms.assessment.dto.user.LoginRequest;
import com.lms.assessment.dto.user.RegisterRequest;
import com.lms.assessment.model.user.User;
import com.lms.assessment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return userService.login(request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).body(null));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken.");
        }
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered.");
        }
        User user = userService.registerUser(request.getUsername(), request.getPassword(),
                request.getEmail(), User.Role.USER);
        return ResponseEntity.ok(java.util.Map.of("id", user.getId(), "username", user.getUsername()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof String userId) || userId.isBlank()) {
            return ResponseEntity.status(401).build();
        }
        return userService.profileForUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }
}
