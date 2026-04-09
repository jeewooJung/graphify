// backend/src/main/java/com/graphify/backend/controller/HealthController.java
package com.graphify.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    /**
     * Health check endpoint for load balancers and monitoring.
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "graphify-backend");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Detailed health information.
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> healthInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "graphify-backend");
        response.put("version", "0.1.0");
        response.put("uptime", Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory());
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
