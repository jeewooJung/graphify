// backend/src/main/java/com/graphify/backend/repository/UserRepository.java
package com.graphify.backend.repository;

import com.graphify.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Find a user by ID (optional).
     */
    Optional<User> findById(Long id);

    /**
     * Find a user by username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Find a user by email.
     */
    Optional<User> findByEmail(String email);
}
