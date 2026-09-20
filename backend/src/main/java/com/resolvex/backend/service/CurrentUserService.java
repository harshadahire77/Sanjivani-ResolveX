package com.resolvex.backend.service;

import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public CurrentUserService(
            UserRepository userRepository
    ) {

        this.userRepository =
                userRepository;
    }

    // ======================================================
    // GET CURRENT LOGGED-IN USER
    // ======================================================

    public Optional<User> getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                authentication == null
                ||
                !authentication.isAuthenticated()
                ||
                authentication.getName() == null
                ||
                authentication.getName().isBlank()
                ||
                "anonymousUser".equalsIgnoreCase(
                        authentication.getName()
                )
        ) {

            return Optional.empty();
        }

        String email =
                authentication
                        .getName()
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

        return userRepository
                .findByEmail(
                        email
                );
    }

    // ======================================================
    // GET USER OR NULL
    // ======================================================

    public User getCurrentUserOrNull() {

        return getCurrentUser()
                .orElse(null);
    }

    // ======================================================
    // CHECK ADMIN
    // ======================================================

    public boolean isAdmin() {

        return hasRole(
                "ADMIN"
        );
    }

    // ======================================================
    // CHECK STUDENT
    // ======================================================

    public boolean isStudent() {

        return hasRole(
                "STUDENT"
        );
    }

    // ======================================================
    // CHECK STAFF
    // ======================================================

    public boolean isStaff() {

        return hasRole(
                "STAFF"
        );
    }

    // ======================================================
    // CHECK FACULTY
    // ======================================================

    public boolean isFaculty() {

        return hasRole(
                "FACULTY"
        );
    }

    // ======================================================
    // STAFF OR FACULTY
    // ======================================================

    public boolean isStaffOrFaculty() {

        return isStaff()
                ||
                isFaculty();
    }

    // ======================================================
    // MANAGEMENT USER
    //
    // Used by ComplaintController.
    // ADMIN + STAFF + FACULTY can manage complaints.
    // ======================================================

    public boolean isManagementUser() {

        return isAdmin()
                ||
                isStaff()
                ||
                isFaculty();
    }

    // ======================================================
    // ROLE CHECK HELPER
    // ======================================================

    public boolean hasRole(
            String requiredRole
    ) {

        if (
                requiredRole == null
                ||
                requiredRole.isBlank()
        ) {

            return false;
        }

        return getCurrentUser()
                .map(
                        user -> {

                            String role =
                                    user.getRole();

                            return role != null
                                    &&
                                    role.equalsIgnoreCase(
                                            requiredRole
                                    );
                        }
                )
                .orElse(
                        false
                );
    }

    // ======================================================
    // ACTIVE USER CHECK
    // ======================================================

    public boolean isCurrentUserActive() {

        return getCurrentUser()
                .map(
                        User::isActive
                )
                .orElse(
                        false
                );
    }
}