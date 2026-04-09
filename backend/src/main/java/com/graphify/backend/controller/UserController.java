package com.graphify.backend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.graphify.backend.service.UserService;
import com.graphify.backend.security.UserPrincipal;
import com.graphify.backend.dto.request.CreateUserRequest;
import com.graphify.backend.dto.request.UpdateUserRequest;
import com.graphify.backend.dto.response.UserDetailDTO;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDetailDTO> registerUser(@Valid @RequestBody CreateUserRequest request) {
        var user = userService.createUser(request.getUsername(), request.getEmail(),
                                         request.getPassword(), null);
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        return new ResponseEntity<>(UserDetailDTO.fromEntity(user), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDetailDTO> getCurrentUser(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        UserDetailDTO user = userService.getUserDetailById(principal.getId());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    @PreAuthorize("@permissionService.canViewUser(#userId, authentication.principal.id)")
    public ResponseEntity<UserDetailDTO> getUserById(@PathVariable Long userId) {
        UserDetailDTO user = userService.getUserDetailById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping({"", "/"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDetailDTO>> getAllUsers() {
        List<UserDetailDTO> users = userService.getAllUsers().stream()
            .map(userDTO -> new UserDetailDTO(
                userDTO.getId(),
                userDTO.getUsername(),
                userDTO.getEmail(),
                userDTO.getDisplayName(),
                userDTO.getRole(),
                userDTO.isActive(),
                userDTO.getLastLoginAt(),
                userDTO.getCreatedAt(),
                null
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{userId}")
    @PreAuthorize("@permissionService.canEditUser(#userId, authentication.principal.id)")
    public ResponseEntity<UserDetailDTO> updateUser(@PathVariable Long userId,
                                                    @Valid @RequestBody UpdateUserRequest request) {
        var user = userService.updateUser(userId, request);
        return ResponseEntity.ok(UserDetailDTO.fromEntity(user));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
