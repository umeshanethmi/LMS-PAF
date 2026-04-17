package com.lms.assessment.dto.user;

import com.lms.assessment.model.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String username;
    private String email;
    private User.Role role;
    private String token; // We'll use a simple placeholder or actual JWT if needed
}
