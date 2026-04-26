package com.lms.assessment.service;

import com.lms.assessment.dto.user.AuthResponse;
import com.lms.assessment.dto.user.LoginRequest;
import com.lms.assessment.model.user.User;
import com.lms.assessment.repository.user.UserRepository;
import com.lms.assessment.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        seedUsers();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            registerUser("admin", "admin123", "admin@campus.com", User.Role.ADMIN);
        }
        if (!userRepository.existsByUsername("tech")) {
            registerUser("tech", "tech123", "tech@campus.com", User.Role.TECHNICIAN);
        }
        if (!userRepository.existsByUsername("user")) {
            registerUser("user", "user123", "resident@campus.com", User.Role.USER);
        }
    }

    public User registerUser(String username, String password, String email, User.Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(role);
        return userRepository.save(user);
    }

    public Optional<AuthResponse> login(LoginRequest request) {
        return userRepository.findByUsername(request.getUsername())
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .token(jwtService.generateToken(user))
                        .build());
    }

    public User findOrCreateFromGoogle(String email, String displayLabel) {
        Optional<User> existing = userRepository.findByEmail(email.trim().toLowerCase());
        if (existing.isPresent()) {
            return existing.get();
        }
        String localPart = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String username = localPart.isEmpty() ? "user" : localPart;
        String candidate = username;
        int i = 0;
        while (userRepository.existsByUsername(candidate)) {
            candidate = username + (++i);
        }
        User user = new User();
        user.setUsername(candidate);
        user.setEmail(email.trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(User.Role.USER);
        return userRepository.save(user);
    }

    public Optional<AuthResponse> profileForUserId(String userId) {
        return userRepository.findById(userId)
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .token(null)
                        .build());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    
    public User updateUserRole(String id, User.Role role) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(role);
        return userRepository.save(user);
    }
}
