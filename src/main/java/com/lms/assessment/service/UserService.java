package com.lms.assessment.service;

import com.lms.assessment.dto.user.AuthResponse;
import com.lms.assessment.dto.user.LoginRequest;
import com.lms.assessment.model.user.User;
import com.lms.assessment.repository.user.UserRepository;
import com.lms.assessment.security.JwtService;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostConstruct
    void seedUsers() {
        if (!userRepository.existsByEmail("admin@sliit.lk")) {
            registerUser("superadmin", "Admin123", "admin@sliit.lk", User.Role.SUPERADMIN);
        }
        if (!userRepository.existsByUsername("admin")) {
            registerUser("admin", "admin123", "admin@campus.com", User.Role.ADMIN);
        }
        if (!userRepository.existsByUsername("tech")) {
            registerUser("tech", "tech123", "tech@campus.com", User.Role.TECHNICIAN);
        }
        if (!userRepository.existsByUsername("user")) {
            registerUser("user", "user123", "resident@campus.com", User.Role.USER);
        }
        if (!userRepository.existsByUsername("instructor")) {
            registerUser("instructor", "instructor123", "instructor@sliit.lk", User.Role.INSTRUCTOR);
        }
        if (!userRepository.existsByUsername("student")) {
            registerUser("student", "student123", "student@sliit.lk", User.Role.STUDENT);
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
        String identifier = request.getUsername();
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        Optional<User> user = identifier.contains("@")
                ? userRepository.findByEmail(identifier)
                : userRepository.findByUsername(identifier);

        return user
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                .map(u -> AuthResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .token(jwtService.generateToken(u))
                        .build());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
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
