// backend/src/main/java/com/graphify/backend/controller/AuthController.java
package com.graphify.backend.controller;

import com.graphify.backend.dto.request.LoginRequest;
import com.graphify.backend.dto.response.LoginResponse;
import com.graphify.backend.security.JwtTokenProvider;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationService authenticationService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationService authenticationService,
                         JwtTokenProvider jwtTokenProvider) {
        this.authenticationService = authenticationService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Login endpoint - returns JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authenticationService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate JWT token endpoint.
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(
            @RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (authenticationService.validateToken(token)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                response.put("valid", true);
                response.put("userId", userId);
                return ResponseEntity.ok(response);
            }
        }

        response.put("valid", false);
        return ResponseEntity.status(401).body(response);
    }

    /**
     * Logout endpoint - client side should discard token.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @AuthenticationPrincipal UserPrincipal user) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
}
