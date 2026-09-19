package com.resolvex.backend.controller;

import com.resolvex.backend.dto.LoginRequest;
import com.resolvex.backend.dto.RegisterRequest;

import com.resolvex.backend.model.User;

import com.resolvex.backend.repository.UserRepository;

import com.resolvex.backend.service.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.jwtService =
                jwtService;
    }

    // ======================================================
    // REGISTER
    // POST /api/auth/register
    //
    // PUBLIC REGISTRATION = STUDENT ONLY
    // ======================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        // ==================================================
        // NAME
        // ==================================================

        if (isBlank(request.getName())) {

            return badRequest(
                    "Name is required."
            );
        }

        // ==================================================
        // UNIVERSITY ID
        // ==================================================

        if (
                isBlank(
                        request.getUniversityId()
                )
        ) {

            return badRequest(
                    "University ID is required."
            );
        }

        // ==================================================
        // EMAIL
        // ==================================================

        if (isBlank(request.getEmail())) {

            return badRequest(
                    "Email is required."
            );
        }

        // ==================================================
        // PASSWORD
        // ==================================================

        if (isBlank(request.getPassword())) {

            return badRequest(
                    "Password is required."
            );
        }

        if (
                request
                        .getPassword()
                        .length()
                        < 6
        ) {

            return badRequest(
                    "Password must contain at least 6 characters."
            );
        }

        // ==================================================
        // NORMALIZE
        // ==================================================

        String email =
                request
                        .getEmail()
                        .trim()
                        .toLowerCase();

        String universityId =
                request
                        .getUniversityId()
                        .trim()
                        .toUpperCase();

        // ==================================================
        // DUPLICATE EMAIL
        // ==================================================

        if (
                userRepository
                        .existsByEmail(email)
        ) {

            return ResponseEntity
                    .status(
                            HttpStatus.CONFLICT
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Email is already registered."
                            )
                    );
        }

        // ==================================================
        // DUPLICATE UNIVERSITY ID
        // ==================================================

        if (
                userRepository
                        .existsByUniversityId(
                                universityId
                        )
        ) {

            return ResponseEntity
                    .status(
                            HttpStatus.CONFLICT
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "University ID is already registered."
                            )
                    );
        }

        // ==================================================
        // CREATE USER
        // ==================================================

        User user =
                new User();

        user.setName(
                request
                        .getName()
                        .trim()
        );

        user.setUniversityId(
                universityId
        );

        user.setEmail(
                email
        );

        user.setPhone(
                clean(
                        request.getPhone()
                )
        );

        user.setDepartment(
                clean(
                        request.getDepartment()
                )
        );

        user.setProgram(
                clean(
                        request.getProgram()
                )
        );

        user.setYear(
                clean(
                        request.getYear()
                )
        );

        // ==================================================
        // CRITICAL SECURITY RULE
        //
        // Ignore request.getRole().
        // Public registration can create STUDENT only.
        // ==================================================

        user.setRole(
                "STUDENT"
        );

        // ==================================================
        // PASSWORD HASH
        // ==================================================

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        // ==================================================
        // ACCOUNT STATUS
        // ==================================================

        user.setActive(
                true
        );

        User savedUser =
                userRepository.save(
                        user
                );

        // ==================================================
        // RESPONSE
        // ==================================================

        Map<String, Object> response =
                safeUserResponse(
                        savedUser
                );

        response.put(
                "message",
                "Student account registered successfully."
        );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        response
                );
    }

    // ======================================================
    // LOGIN
    // POST /api/auth/login
    // ======================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        // ==================================================
        // VALIDATION
        // ==================================================

        if (isBlank(request.getEmail())) {

            return badRequest(
                    "Email is required."
            );
        }

        if (isBlank(request.getPassword())) {

            return badRequest(
                    "Password is required."
            );
        }

        // ==================================================
        // NORMALIZE EMAIL
        // ==================================================

        String email =
                request
                        .getEmail()
                        .trim()
                        .toLowerCase();

        // ==================================================
        // FIND USER
        // ==================================================

        Optional<User> optionalUser =
                userRepository
                        .findByEmail(
                                email
                        );

        if (optionalUser.isEmpty()) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password."
                            )
                    );
        }

        User user =
                optionalUser.get();

        // ==================================================
        // PASSWORD CHECK
        // ==================================================

        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )
        ) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password."
                            )
                    );
        }

        // ==================================================
        // ACTIVE ACCOUNT CHECK
        // ==================================================

        if (!user.isActive()) {

            return ResponseEntity
                    .status(
                            HttpStatus.FORBIDDEN
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Your account is inactive. Please contact the administrator."
                            )
                    );
        }

        // ==================================================
        // ROLE CHECK
        // ==================================================

        if (
                user.getRole() == null
                ||
                user
                        .getRole()
                        .isBlank()
        ) {

            return ResponseEntity
                    .status(
                            HttpStatus.FORBIDDEN
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "No valid role is assigned to this account."
                            )
                    );
        }

        // ==================================================
        // GENERATE JWT
        // ==================================================

        String token =
                jwtService
                        .generateToken(
                                user
                        );

        // ==================================================
        // LOGIN RESPONSE
        // ==================================================

        Map<String, Object> response =
                safeUserResponse(
                        user
                );

        response.put(
                "token",
                token
        );

        response.put(
                "tokenType",
                "Bearer"
        );

        response.put(
                "message",
                "Login successful."
        );

        return ResponseEntity.ok(
                response
        );
    }

    // ======================================================
    // SAFE USER RESPONSE
    // PASSWORD NEVER RETURNED
    // ======================================================

    private Map<String, Object> safeUserResponse(
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
    // CLEAN OPTIONAL STRING
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

    // ======================================================
    // CHECK BLANK
    // ======================================================

    private boolean isBlank(
            String value
    ) {

        return value == null
                ||
                value.trim().isEmpty();
    }

    // ======================================================
    // BAD REQUEST
    // ======================================================

    private ResponseEntity<?> badRequest(
            String message
    ) {

        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }
}