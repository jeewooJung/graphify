package com.graphify.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.graphify.backend.dto.request.LoginRequest;
import com.graphify.backend.dto.response.LoginResponse;
import com.graphify.backend.security.JwtTokenProvider;

@Service
@Transactional
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Value("${spring.security.jwt.expiration}")
    private long jwtExpiration;

    public AuthenticationService(AuthenticationManager authenticationManager,
                               JwtTokenProvider jwtTokenProvider,
                               UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userService = userService;
    }

    public LoginResponse authenticate(LoginRequest loginRequest) {
        com.graphify.backend.entity.User user;
        try {
            user = userService.getUserByUsername(loginRequest.getUsername());
        } catch (RuntimeException e) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new BadCredentialsException("User account is deactivated");
        }

        if (!userService.validatePassword(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // Update last login
        userService.updateLastLogin(user.getId());

        // Generate JWT token
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        String token = jwtTokenProvider.generateToken(authentication);

        return LoginResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole().toString())
            .expiresIn(jwtExpiration / 1000) // Convert to seconds
            .build();
    }

    public LoginResponse validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        var user = userService.getUserById(userId);

        return LoginResponse.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole().toString())
            .build();
    }
}
