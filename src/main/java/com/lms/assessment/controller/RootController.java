package com.lms.assessment.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> body = new HashMap<>();
        body.put("service", "assessment-service");
        body.put("status", "UP");
        body.put("apiBase", "/api");
        body.put("frontend", "http://localhost:5173");
        return body;
    }
}
