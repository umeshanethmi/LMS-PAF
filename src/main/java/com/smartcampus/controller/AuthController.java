package com.smartcampus.controller;

import com.smartcampus.models.User;
import com.smartcampus.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            return ResponseEntity.ok(Map.of("token", token));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            User user = authService.register(
                    registerRequest.getName(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword()
            );
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request, 
                                           @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            String token = authService.updateProfile(
                userDetails.getUsername(), 
                request.getName(), 
                request.getImageUrl(),
                request.getPhone(),
                request.getDepartment(),
                request.getBio()
            );
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @Data
    public static class UpdateProfileRequest {
        @jakarta.validation.constraints.NotBlank(message = "Name is required")
        @jakarta.validation.constraints.Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        private String name;

        private String imageUrl;

        @jakarta.validation.constraints.Pattern(regexp = "^$|[0-9\\+\\-\\s\\(\\)]{7,20}", message = "Invalid phone number format")
        private String phone;

        private String department;

        @jakarta.validation.constraints.Size(max = 500, message = "Bio cannot exceed 500 characters")
        private String bio;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }
}
