package com.resolvex.backend.controller;

import com.resolvex.backend.dto.UpdateProfileRequest;
import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.UserRepository;
import com.resolvex.backend.service.CurrentUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UserController(
            UserRepository userRepository,
            CurrentUserService currentUserService
    ) {
        this.userRepository =
                userRepository;

        this.currentUserService =
                currentUserService;
    }

    // ======================================================
    // GET PROFILE
    // ======================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id
    ) {

        Optional<User> loggedInUser =
                currentUserService
                        .getCurrentUser();

        if (loggedInUser.isEmpty()) {
            return unauthorized();
        }

        // User can see own profile.
        // Admin can see another profile.
        if (
                !loggedInUser.get()
                        .getId()
                        .equals(id)
                &&
                !currentUserService
                        .isAdmin()
        ) {

            return forbidden(
                    "You cannot access another user's profile."
            );
        }

        Optional<User> optionalUser =
                userRepository
                        .findById(id);

        if (optionalUser.isEmpty()) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "User not found."
                            )
                    );
        }

        return ResponseEntity.ok(
                userResponse(
                        optionalUser.get()
                )
        );
    }

    // ======================================================
    // UPDATE PROFILE
    // ======================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateProfileRequest request
    ) {

        Optional<User> loggedInUser =
                currentUserService
                        .getCurrentUser();

        if (loggedInUser.isEmpty()) {
            return unauthorized();
        }

        // Normal users can update only themselves.
        // Admin may update another profile.
        if (
                !loggedInUser.get()
                        .getId()
                        .equals(id)
                &&
                !currentUserService
                        .isAdmin()
        ) {

            return forbidden(
                    "You cannot update another user's profile."
            );
        }

        Optional<User> optionalUser =
                userRepository
                        .findById(id);

        if (optionalUser.isEmpty()) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "User not found."
                            )
                    );
        }

        User user =
                optionalUser.get();

        if (
                request.getName() != null
                &&
                !request.getName()
                        .trim()
                        .isEmpty()
        ) {

            user.setName(
                    request.getName()
                            .trim()
            );
        }

        if (
                request.getPhone()
                        != null
        ) {

            user.setPhone(
                    clean(
                            request.getPhone()
                    )
            );
        }

        if (
                request.getDepartment()
                        != null
        ) {

            user.setDepartment(
                    clean(
                            request.getDepartment()
                    )
            );
        }

        if (
                request.getProgram()
                        != null
        ) {

            user.setProgram(
                    clean(
                            request.getProgram()
                    )
            );
        }

        if (
                request.getYear()
                        != null
        ) {

            user.setYear(
                    clean(
                            request.getYear()
                    )
            );
        }

        User updatedUser =
                userRepository.save(
                        user
                );

        Map<String, Object> response =
                userResponse(
                        updatedUser
                );

        response.put(
                "message",
                "Profile updated successfully."
        );

        return ResponseEntity.ok(
                response
        );
    }

    // ======================================================
    // SAFE RESPONSE
    // ======================================================

    private Map<String, Object>
    userResponse(
            User user
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "userId",
                user.getId()
        );

        response.put(
                "name",
                user.getName()
        );

        response.put(
                "universityId",
                user.getUniversityId()
        );

        response.put(
                "email",
                user.getEmail()
        );

        response.put(
                "phone",
                user.getPhone()
        );

        response.put(
                "role",
                user.getRole()
        );

        response.put(
                "department",
                user.getDepartment()
        );

        response.put(
                "program",
                user.getProgram()
        );

        response.put(
                "year",
                user.getYear()
        );

        response.put(
                "active",
                user.isActive()
        );

        response.put(
                "createdAt",
                user.getCreatedAt()
        );

        response.put(
                "updatedAt",
                user.getUpdatedAt()
        );

        return response;
    }

    // ======================================================
    // HELPERS
    // ======================================================

    private String clean(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    private ResponseEntity<?>
    unauthorized() {

        return ResponseEntity
                .status(
                        HttpStatus.UNAUTHORIZED
                )
                .body(
                        Map.of(
                                "message",
                                "Authentication required."
                        )
                );
    }

    private ResponseEntity<?>
    forbidden(
            String message
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.FORBIDDEN
                )
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }
}