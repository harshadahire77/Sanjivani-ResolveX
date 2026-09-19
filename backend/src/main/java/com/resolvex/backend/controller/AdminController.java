package com.resolvex.backend.controller;

import com.resolvex.backend.dto.CreateManagedUserRequest;
import com.resolvex.backend.model.Complaint;
import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.ComplaintRepository;
import com.resolvex.backend.repository.UserRepository;
import com.resolvex.backend.service.CurrentUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    private final ComplaintRepository complaintRepository;

    private final CurrentUserService currentUserService;

    private final BCryptPasswordEncoder passwordEncoder =
        new BCryptPasswordEncoder();

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AdminController(
        UserRepository userRepository,
        ComplaintRepository complaintRepository,
        CurrentUserService currentUserService
    ) {
        this.userRepository =
            userRepository;

        this.complaintRepository =
            complaintRepository;

        this.currentUserService =
            currentUserService;
    }

    // =====================================================
    // ADMIN CHECK
    // =====================================================

    private ResponseEntity<Map<String, Object>>
        adminRequired() {

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "status",
            HttpStatus.FORBIDDEN.value()
        );

        response.put(
            "message",
            "Administrator access required."
        );

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(response);
    }

    // =====================================================
    // DASHBOARD STATS
    // GET /api/admin/stats
    // =====================================================

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        long totalUsers =
            userRepository.count();

        long activeUsers =
            userRepository.countByActiveTrue();

        long inactiveUsers =
            userRepository.countByActiveFalse();

        long students =
            userRepository
                .countByRoleIgnoreCase(
                    "STUDENT"
                );

        long staff =
            userRepository
                .countByRoleIgnoreCase(
                    "STAFF"
                );

        long faculty =
            userRepository
                .countByRoleIgnoreCase(
                    "FACULTY"
                );

        long admins =
            userRepository
                .countByRoleIgnoreCase(
                    "ADMIN"
                );

        long totalComplaints =
            complaintRepository.count();

        long openComplaints =
            complaintRepository
                .countByStatus("OPEN");

        long assignedComplaints =
            complaintRepository
                .countByStatus("ASSIGNED");

        long inProgressComplaints =
            complaintRepository
                .countByStatus(
                    "IN_PROGRESS"
                );

        long resolvedComplaints =
            complaintRepository
                .countByStatus(
                    "RESOLVED"
                );

        long closedComplaints =
            complaintRepository
                .countByStatus(
                    "CLOSED"
                );

        long urgentComplaints =
            complaintRepository
                .countByPriority(
                    "URGENT"
                );

        long completed =
            resolvedComplaints +
            closedComplaints;

        double resolutionRate =
            totalComplaints > 0
                ? (
                    completed * 100.0
                  ) / totalComplaints
                : 0.0;

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "totalUsers",
            totalUsers
        );

        response.put(
            "activeUsers",
            activeUsers
        );

        response.put(
            "inactiveUsers",
            inactiveUsers
        );

        response.put(
            "students",
            students
        );

        response.put(
            "staff",
            staff
        );

        response.put(
            "faculty",
            faculty
        );

        response.put(
            "admins",
            admins
        );

        response.put(
            "totalComplaints",
            totalComplaints
        );

        response.put(
            "openComplaints",
            openComplaints
        );

        response.put(
            "assignedComplaints",
            assignedComplaints
        );

        response.put(
            "inProgressComplaints",
            inProgressComplaints
        );

        response.put(
            "resolvedComplaints",
            resolvedComplaints
        );

        response.put(
            "closedComplaints",
            closedComplaints
        );

        response.put(
            "urgentComplaints",
            urgentComplaints
        );

        response.put(
            "resolutionRate",
            Math.round(
                resolutionRate
            )
        );

        return ResponseEntity.ok(
            response
        );
    }

    // =====================================================
    // ADMIN ANALYTICS
    // GET /api/admin/analytics
    // =====================================================

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        List<Complaint> complaints =
            complaintRepository
                .findAllByOrderByCreatedAtDesc();

        // =================================================
        // STATUS COUNTS
        // =================================================

        Map<String, Long> statusCounts =
            new LinkedHashMap<>();

        statusCounts.put(
            "OPEN",
            0L
        );

        statusCounts.put(
            "ASSIGNED",
            0L
        );

        statusCounts.put(
            "IN_PROGRESS",
            0L
        );

        statusCounts.put(
            "RESOLVED",
            0L
        );

        statusCounts.put(
            "CLOSED",
            0L
        );

        // =================================================
        // PRIORITY COUNTS
        // =================================================

        Map<String, Long> priorityCounts =
            new LinkedHashMap<>();

        priorityCounts.put(
            "LOW",
            0L
        );

        priorityCounts.put(
            "MEDIUM",
            0L
        );

        priorityCounts.put(
            "HIGH",
            0L
        );

        priorityCounts.put(
            "URGENT",
            0L
        );

        // =================================================
        // CATEGORY COUNTS
        // =================================================

        Map<String, Long> categoryCounts =
            new LinkedHashMap<>();

        // =================================================
        // STAFF WORKLOAD
        // =================================================

        Map<String, Long> staffWorkload =
            new LinkedHashMap<>();

        // =================================================
        // COUNT DATA
        // =================================================

        for (Complaint complaint : complaints) {

            String status =
                normalize(
                    complaint.getStatus()
                );

            if (
                status != null &&
                statusCounts
                    .containsKey(status)
            ) {
                statusCounts.put(
                    status,
                    statusCounts.get(status) +
                        1
                );
            }

            String priority =
                normalize(
                    complaint.getPriority()
                );

            if (
                priority != null &&
                priorityCounts
                    .containsKey(priority)
            ) {
                priorityCounts.put(
                    priority,
                    priorityCounts
                        .get(priority) +
                        1
                );
            }

            String category =
                complaint.getCategory();

            if (
                category != null &&
                !category.isBlank()
            ) {
                categoryCounts.put(
                    category,
                    categoryCounts
                        .getOrDefault(
                            category,
                            0L
                        ) +
                        1
                );
            }

            User assignedUser =
                complaint
                    .getAssignedUser();

            if (assignedUser != null) {

                String key =
                    assignedUser.getName();

                if (
                    key == null ||
                    key.isBlank()
                ) {
                    key =
                        assignedUser
                            .getEmail();
                }

                if (key != null) {
                    staffWorkload.put(
                        key,
                        staffWorkload
                            .getOrDefault(
                                key,
                                0L
                            ) +
                            1
                    );
                }
            }
        }

        // =================================================
        // RECENT COMPLAINTS
        // =================================================

        List<Map<String, Object>>
            recentComplaints =
                new ArrayList<>();

        List<Complaint> topComplaints =
            complaintRepository
                .findTop5ByOrderByCreatedAtDesc();

        for (
            Complaint complaint :
            topComplaints
        ) {
            recentComplaints.add(
                complaintResponse(
                    complaint
                )
            );
        }

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "statusCounts",
            statusCounts
        );

        response.put(
            "priorityCounts",
            priorityCounts
        );

        response.put(
            "categoryCounts",
            categoryCounts
        );

        response.put(
            "staffWorkload",
            staffWorkload
        );

        response.put(
            "recentComplaints",
            recentComplaints
        );

        response.put(
            "totalComplaints",
            complaints.size()
        );

        return ResponseEntity.ok(
            response
        );
    }

    // =====================================================
    // GET ALL USERS
    // GET /api/admin/users
    // =====================================================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        List<User> users =
            userRepository
                .findAllByOrderByCreatedAtDesc();

        List<Map<String, Object>>
            response =
                new ArrayList<>();

        for (User user : users) {
            response.add(
                safeUserResponse(
                    user
                )
            );
        }

        return ResponseEntity.ok(
            response
        );
    }

    // =====================================================
    // GET USER BY ID
    // GET /api/admin/users/{id}
    // =====================================================

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(
        @PathVariable Long id
    ) {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        Optional<User> optionalUser =
            userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return error(
                HttpStatus.NOT_FOUND,
                "User not found."
            );
        }

        return ResponseEntity.ok(
            safeUserResponse(
                optionalUser.get()
            )
        );
    }

    // =====================================================
    // CREATE STAFF / FACULTY
    // POST /api/admin/users
    // =====================================================

    @PostMapping("/users")
    public ResponseEntity<?> createManagedUser(
        @RequestBody CreateManagedUserRequest request
    ) {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        // =================================================
        // VALIDATION
        // =================================================

        if (
            request.getName() == null ||
            request.getName().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Name is required."
            );
        }

        if (
            request.getUniversityId() == null ||
            request
                .getUniversityId()
                .isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "University ID is required."
            );
        }

        if (
            request.getEmail() == null ||
            request.getEmail().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Email is required."
            );
        }

        if (
            request.getPassword() == null ||
            request.getPassword().length() <
                6
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Password must contain at least 6 characters."
            );
        }

        if (
            request.getRole() == null ||
            request.getRole().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Role is required."
            );
        }

        String role =
            request
                .getRole()
                .trim()
                .toUpperCase(
                    Locale.ROOT
                );

        if (
            !"STAFF".equals(role) &&
            !"FACULTY".equals(role)
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Admin can create only STAFF or FACULTY accounts."
            );
        }

        String email =
            request
                .getEmail()
                .trim()
                .toLowerCase(
                    Locale.ROOT
                );

        String universityId =
            request
                .getUniversityId()
                .trim()
                .toUpperCase(
                    Locale.ROOT
                );

        // =================================================
        // DUPLICATES
        // =================================================

        if (
            userRepository
                .existsByEmail(email)
        ) {
            return error(
                HttpStatus.CONFLICT,
                "Email is already registered."
            );
        }

        if (
            userRepository
                .existsByUniversityId(
                    universityId
                )
        ) {
            return error(
                HttpStatus.CONFLICT,
                "University ID is already registered."
            );
        }

        // =================================================
        // CREATE
        // =================================================

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

        user.setRole(
            role
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

        user.setPassword(
            passwordEncoder.encode(
                request.getPassword()
            )
        );

        user.setActive(
            true
        );

        User saved =
            userRepository.save(
                user
            );

        Map<String, Object> response =
            safeUserResponse(
                saved
            );

        response.put(
            "message",
            role +
                " account created successfully."
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    // =====================================================
    // ACTIVATE USER
    // PUT /api/admin/users/{id}/activate
    // =====================================================

    @PutMapping(
        "/users/{id}/activate"
    )
    public ResponseEntity<?> activateUser(
        @PathVariable Long id
    ) {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        Optional<User> optionalUser =
            userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return error(
                HttpStatus.NOT_FOUND,
                "User not found."
            );
        }

        User user =
            optionalUser.get();

        user.setActive(
            true
        );

        User saved =
            userRepository.save(
                user
            );

        Map<String, Object> response =
            safeUserResponse(
                saved
            );

        response.put(
            "message",
            "User activated successfully."
        );

        return ResponseEntity.ok(
            response
        );
    }

    // =====================================================
    // DEACTIVATE USER
    // PUT /api/admin/users/{id}/deactivate
    // =====================================================

    @PutMapping(
        "/users/{id}/deactivate"
    )
    public ResponseEntity<?> deactivateUser(
        @PathVariable Long id
    ) {

        if (!currentUserService.isAdmin()) {
            return adminRequired();
        }

        User currentAdmin =
            currentUserService
                .getCurrentUserOrNull();

        if (
            currentAdmin != null &&
            currentAdmin
                .getId()
                .equals(id)
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "You cannot deactivate your own administrator account."
            );
        }

        Optional<User> optionalUser =
            userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return error(
                HttpStatus.NOT_FOUND,
                "User not found."
            );
        }

        User user =
            optionalUser.get();

        user.setActive(
            false
        );

        User saved =
            userRepository.save(
                user
            );

        Map<String, Object> response =
            safeUserResponse(
                saved
            );

        response.put(
            "message",
            "User deactivated successfully."
        );

        return ResponseEntity.ok(
            response
        );
    }

    // =====================================================
    // SAFE USER RESPONSE
    // =====================================================

    private Map<String, Object>
        safeUserResponse(
            User user
        ) {

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "id",
            user.getId()
        );

        // Frontend compatibility
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

    // =====================================================
    // SAFE COMPLAINT RESPONSE
    // =====================================================

    private Map<String, Object>
        complaintResponse(
            Complaint complaint
        ) {

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "id",
            complaint.getId()
        );

        response.put(
            "complaintCode",
            complaint.getComplaintCode()
        );

        response.put(
            "title",
            complaint.getTitle()
        );

        response.put(
            "category",
            complaint.getCategory()
        );

        response.put(
            "location",
            complaint.getLocation()
        );

        response.put(
            "description",
            complaint.getDescription()
        );

        response.put(
            "priority",
            complaint.getPriority()
        );

        response.put(
            "status",
            complaint.getStatus()
        );

        response.put(
            "resolutionNote",
            complaint.getResolutionNote()
        );

        response.put(
            "createdAt",
            complaint.getCreatedAt()
        );

        response.put(
            "updatedAt",
            complaint.getUpdatedAt()
        );

        response.put(
            "resolvedAt",
            complaint.getResolvedAt()
        );

        // =================================================
        // OWNER
        // =================================================

        response.put(
            "user",
            complaint.getUser() != null
                ? safeUserResponse(
                    complaint.getUser()
                )
                : null
        );

        // =================================================
        // CORRECT ASSIGNMENT
        // Old assignedTo has been removed.
        // =================================================

        response.put(
            "assignedUser",
            complaint.getAssignedUser() != null
                ? safeUserResponse(
                    complaint
                        .getAssignedUser()
                )
                : null
        );

        return response;
    }

    // =====================================================
    // CLEAN TEXT
    // =====================================================

    private String clean(
        String value
    ) {

        if (value == null) {
            return null;
        }

        String result =
            value.trim();

        return result.isBlank()
            ? null
            : result;
    }

    // =====================================================
    // NORMALIZE
    // =====================================================

    private String normalize(
        String value
    ) {

        if (
            value == null ||
            value.isBlank()
        ) {
            return null;
        }

        return value
            .trim()
            .toUpperCase(
                Locale.ROOT
            );
    }

    // =====================================================
    // ERROR RESPONSE
    // =====================================================

    private ResponseEntity<Map<String, Object>>
        error(
            HttpStatus status,
            String message
        ) {

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "status",
            status.value()
        );

        response.put(
            "message",
            message
        );

        return ResponseEntity
            .status(status)
            .body(response);
    }
}