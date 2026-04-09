// backend/src/main/java/com/graphify/backend/service/AuthenticationService.java
package com.graphify.backend.service;

import com.graphify.backend.dto.request.LoginRequest;
import com.graphify.backend.dto.response.LoginResponse;
import com.graphify.backend.entity.User;
import com.graphify.backend.exception.UnauthorizedException;
import com.graphify.backend.repository.UserRepository;
import com.graphify.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationService(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Authenticate user with username and password.
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
            .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Update last login timestamp
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate token
        String token = jwtTokenProvider.generateTokenFromUserId(user.getId());

        return new LoginResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    /**
     * Validate JWT token.
     */
    public boolean validateToken(String token) {
        try {
            jwtTokenProvider.validateToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
