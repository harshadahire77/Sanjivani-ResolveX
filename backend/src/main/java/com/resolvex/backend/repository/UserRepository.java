package com.resolvex.backend.repository;

import com.resolvex.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ======================================================
    // FIND BY EMAIL
    // ======================================================

    Optional<User> findByEmail(String email);

    // ======================================================
    // FIND BY UNIVERSITY ID
    // ======================================================

    Optional<User> findByUniversityId(
            String universityId
    );

    // ======================================================
    // DUPLICATE CHECKS
    // ======================================================

    boolean existsByEmail(
            String email
    );

    boolean existsByUniversityId(
            String universityId
    );

    // ======================================================
    // ALL USERS - NEWEST FIRST
    // ======================================================

    List<User> findAllByOrderByCreatedAtDesc();

    // ======================================================
    // ACCOUNT STATUS COUNTS
    // ======================================================

    long countByActiveTrue();

    long countByActiveFalse();

    // ======================================================
    // ROLE COUNT
    // ======================================================

    long countByRoleIgnoreCase(
            String role
    );

    // ======================================================
    // ACTIVE STAFF / FACULTY FOR COMPLAINT ASSIGNMENT
    // ======================================================

    List<User> findByRoleInAndActiveTrueOrderByNameAsc(
            Collection<String> roles
    );
}