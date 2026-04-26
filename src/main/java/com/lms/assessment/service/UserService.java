package com.lms.assessment.service;

import com.lms.assessment.dto.user.AuthResponse;
import com.lms.assessment.dto.user.LoginRequest;
import com.lms.assessment.model.user.User;
import com.lms.assessment.repository.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        // Seed Official Technician Registry
        seedTechnician("TECH-101", "Saman Kumara", "saman@campus.com", "Electrical & Power");
        seedTechnician("TECH-102", "Sunil Perera", "sunil@campus.com", "Plumbing & Piping");
        seedTechnician("TECH-103", "Kamal Silva", "kamal@campus.com", "IT & Network Support");
        seedTechnician("TECH-104", "Nimal Sirisena", "nimal@campus.com", "HVAC & Air Conditioning");
        seedTechnician("TECH-105", "Aruni Jayawardena", "aruni@campus.com", "Civil & Structural");
        seedTechnician("TECH-106", "Kasun Bandara", "kasun@campus.com", "Furniture & Carpentry");
        seedTechnician("TECH-107", "Sajeewa Perera", "sajeewa@campus.com", "Security & Surveillance");
    }

    private void seedTechnician(String id, String username, String email, String specialty) {
        if (!userRepository.existsById(id)) {
            User tech = new User();
            tech.setId(id);
            tech.setUsername(username);
            tech.setPassword(passwordEncoder.encode("tech123"));
            tech.setEmail(email);
            tech.setRole(User.Role.TECHNICIAN);
            tech.setSpecialty(specialty);
            userRepository.save(tech);
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
                        .token("mock-jwt-token-" + user.getId())
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
