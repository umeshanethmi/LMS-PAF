package com.lms.assessment.controller.user;

import com.lms.assessment.model.user.User;
import com.lms.assessment.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable String id, @RequestParam User.Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getTechnicians() {
        return ResponseEntity.ok(userService.getAllUsers().stream()
                .filter(u -> u.getRole() == User.Role.TECHNICIAN)
                .toList());
    }
}
