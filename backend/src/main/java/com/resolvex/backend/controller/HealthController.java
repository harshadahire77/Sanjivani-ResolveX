package com.resolvex.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> healthCheck() {

        Map<String, String> response = new LinkedHashMap<>();

        response.put("status", "UP");
        response.put(
                "message",
                "ResolveX backend is running successfully"
        );

        return response;
    }
}