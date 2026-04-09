package com.graphify.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.graphify.backend.entity.User;
import com.graphify.backend.entity.enums.UserRole;
import com.graphify.backend.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default ADMIN account for E2E testing
            if (!userRepository.existsByUsername("admin@test.com")) {
                User admin = User.builder()
                    .username("admin@test.com")
                    .email("admin@test.com")
                    .passwordHash(passwordEncoder.encode("Admin1234!"))
                    .role(UserRole.ADMIN)
                    .displayName("Admin User")
                    .isActive(true)
                    .build();
                userRepository.save(admin);
            }

            // Create default test user1 for E2E testing
            if (!userRepository.existsByUsername("testuser1@test.com")) {
                User user1 = User.builder()
                    .username("testuser1@test.com")
                    .email("testuser1@test.com")
                    .passwordHash(passwordEncoder.encode("Test1234!"))
                    .role(UserRole.MEMBER)
                    .displayName("Test User 1")
                    .isActive(true)
                    .build();
                userRepository.save(user1);
            }
        };
    }
}
