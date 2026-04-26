package com.lms.assessment.dto.user;

import lombok.Data;

@Data
public class LoginRequest {
    /** Either username or email (frontend may send either field name). */
    private String username;
    private String email;
    private String password;
}
