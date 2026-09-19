package com.resolvex.backend.service;

import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    // ======================================================
    // GET CURRENT LOGGED-IN USER
    // ======================================================

    public Optional<User> getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            return Optional.empty();
        }

        if (!authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String email =
                authentication.getName();

        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        if ("anonymousUser".equalsIgnoreCase(email)) {
            return Optional.empty();
        }

        return userRepository.findByEmail(
                email.trim().toLowerCase()
        );
    }

    // ======================================================
    // GET CURRENT USER OR NULL
    // ======================================================

    public User getCurrentUserOrNull() {

        return getCurrentUser()
                .orElse(null);
    }

    // ======================================================
    // CHECK CURRENT USER ID
    // ======================================================

    public boolean isCurrentUser(
            Long userId
    ) {

        if (userId == null) {
            return false;
        }

        Optional<User> currentUser =
                getCurrentUser();

        return currentUser.isPresent()
                &&
                userId.equals(
                        currentUser.get().getId()
                );
    }

    // ======================================================
    // CHECK ROLE
    // ======================================================

    public boolean hasRole(
            String role
    ) {

        if (role == null) {
            return false;
        }

        Optional<User> currentUser =
                getCurrentUser();

        if (currentUser.isEmpty()) {
            return false;
        }

        String currentRole =
                currentUser
                        .get()
                        .getRole();

        return currentRole != null
                &&
                currentRole.equalsIgnoreCase(
                        role
                );
    }

    // ======================================================
    // STUDENT
    // ======================================================

    public boolean isStudent() {
        return hasRole("STUDENT");
    }

    // ======================================================
    // MANAGEMENT USER
    // ======================================================

    public boolean isManagementUser() {

        Optional<User> currentUser =
                getCurrentUser();

        if (currentUser.isEmpty()) {
            return false;
        }

        String role =
                currentUser
                        .get()
                        .getRole();

        if (role == null) {
            return false;
        }

        role = role
                .trim()
                .toUpperCase();

        return role.equals("STAFF")
                ||
                role.equals("FACULTY")
                ||
                role.equals("ADMIN");
    }

    // ======================================================
    // ADMIN
    // ======================================================

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }
}