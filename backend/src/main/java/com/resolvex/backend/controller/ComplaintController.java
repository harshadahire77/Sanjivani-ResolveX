package com.resolvex.backend.controller;

import com.resolvex.backend.dto.AssignComplaintRequest;
import com.resolvex.backend.dto.CreateComplaintRequest;
import com.resolvex.backend.dto.UpdateComplaintRequest;
import com.resolvex.backend.model.Complaint;
import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.ComplaintRepository;
import com.resolvex.backend.repository.UserRepository;
import com.resolvex.backend.service.CurrentUserService;
import com.resolvex.backend.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintRepository
        complaintRepository;

    private final UserRepository
        userRepository;

    private final CurrentUserService
        currentUserService;

    private final NotificationService
        notificationService;

    // =====================================================
    // VALID VALUES
    // =====================================================

    private static final Set<String>
        VALID_PRIORITIES =
            Set.of(
                "LOW",
                "MEDIUM",
                "HIGH",
                "URGENT"
            );

    private static final Set<String>
        VALID_STATUSES =
            Set.of(
                "OPEN",
                "ASSIGNED",
                "IN_PROGRESS",
                "RESOLVED",
                "CLOSED"
            );

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ComplaintController(
        ComplaintRepository complaintRepository,
        UserRepository userRepository,
        CurrentUserService currentUserService,
        NotificationService notificationService
    ) {

        this.complaintRepository =
            complaintRepository;

        this.userRepository =
            userRepository;

        this.currentUserService =
            currentUserService;

        this.notificationService =
            notificationService;
    }

    // =====================================================
    // CREATE COMPLAINT
    // STUDENT ONLY
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createComplaint(
        @RequestBody CreateComplaintRequest request
    ) {

        User currentUser =
            currentUserService
                .getCurrentUserOrNull();

        if (currentUser == null) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Authentication required."
            );
        }

        if (
            !isRole(
                currentUser,
                "STUDENT"
            )
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "Only students can create complaints."
            );
        }

        if (
            request.getTitle() == null ||
            request.getTitle().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Complaint title is required."
            );
        }

        if (
            request.getCategory() == null ||
            request.getCategory().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Complaint category is required."
            );
        }

        if (
            request.getLocation() == null ||
            request.getLocation().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Complaint location is required."
            );
        }

        if (
            request.getDescription() == null ||
            request.getDescription().isBlank()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Complaint description is required."
            );
        }

        String priority =
            normalizePriority(
                request.getPriority()
            );

        if (priority == null) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Invalid complaint priority."
            );
        }

        Complaint complaint =
            new Complaint();

        complaint.setUser(
            currentUser
        );

        complaint.setTitle(
            request
                .getTitle()
                .trim()
        );

        complaint.setCategory(
            request
                .getCategory()
                .trim()
        );

        complaint.setLocation(
            request
                .getLocation()
                .trim()
        );

        complaint.setDescription(
            request
                .getDescription()
                .trim()
        );

        complaint.setPriority(
            priority
        );

        complaint.setStatus(
            "OPEN"
        );

        complaint.setAssignedUser(
            null
        );

        Complaint saved =
            complaintRepository.save(
                complaint
            );

        notificationService
            .createNotification(
                currentUser,
                "Complaint Submitted",
                "Your complaint " +
                    saved.getComplaintCode() +
                    " has been submitted successfully.",
                "SUCCESS",
                saved.getId()
            );

        return ResponseEntity
            .status(
                HttpStatus.CREATED
            )
            .body(
                complaintResponse(
                    saved
                )
            );
    }

    // =====================================================
    // GET ALL COMPLAINTS
    // STAFF / FACULTY / ADMIN
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllComplaints() {

        if (
            !currentUserService
                .isManagementUser()
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "You do not have permission to view all complaints."
            );
        }

        List<Complaint> complaints =
            complaintRepository
                .findAllByOrderByCreatedAtDesc();

        return ResponseEntity.ok(
            complaintListResponse(
                complaints
            )
        );
    }

    // =====================================================
    // GET ASSIGNABLE USERS
    // =====================================================

    @GetMapping("/assignable-users")
    public ResponseEntity<?> getAssignableUsers() {

        if (
            !currentUserService
                .isManagementUser()
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "Access denied."
            );
        }

        List<String> roles =
            List.of(
                "STAFF",
                "FACULTY"
            );

        List<User> users =
            userRepository
                .findByRoleInAndActiveTrueOrderByNameAsc(
                    roles
                );

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
    // STAFF / FACULTY - MY ASSIGNED COMPLAINTS
    // =====================================================

    @GetMapping("/assigned/me")
    public ResponseEntity<?> getMyAssignedComplaints() {

        User currentUser =
            currentUserService
                .getCurrentUserOrNull();

        if (currentUser == null) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Authentication required."
            );
        }

        if (
            !isRole(
                currentUser,
                "STAFF"
            ) &&
            !isRole(
                currentUser,
                "FACULTY"
            )
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "Only Staff or Faculty can access assigned complaints."
            );
        }

        List<Complaint> complaints =
            complaintRepository
                .findByAssignedUserIdOrderByCreatedAtDesc(
                    currentUser.getId()
                );

        return ResponseEntity.ok(
            complaintListResponse(
                complaints
            )
        );
    }

    // =====================================================
    // GET COMPLAINT BY CODE
    // =====================================================

    @GetMapping("/code/{complaintCode}")
    public ResponseEntity<?> getComplaintByCode(
        @PathVariable String complaintCode
    ) {

        Optional<Complaint> optionalComplaint =
            complaintRepository
                .findByComplaintCode(
                    complaintCode
                );

        if (
            optionalComplaint.isEmpty()
        ) {
            return error(
                HttpStatus.NOT_FOUND,
                "Complaint not found."
            );
        }

        Complaint complaint =
            optionalComplaint.get();

        if (
            !canViewComplaint(
                complaint
            )
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "You do not have permission to view this complaint."
            );
        }

        return ResponseEntity.ok(
            complaintResponse(
                complaint
            )
        );
    }

    // =====================================================
    // GET USER COMPLAINTS
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserComplaints(
        @PathVariable Long userId
    ) {

        User currentUser =
            currentUserService
                .getCurrentUserOrNull();

        if (currentUser == null) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Authentication required."
            );
        }

        boolean ownAccount =
            currentUser
                .getId()
                .equals(
                    userId
                );

        if (
            !ownAccount &&
            !currentUserService
                .isManagementUser()
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "You cannot view another user's complaints."
            );
        }

        List<Complaint> complaints =
            complaintRepository
                .findByUserIdOrderByCreatedAtDesc(
                    userId
                );

        return ResponseEntity.ok(
            complaintListResponse(
                complaints
            )
        );
    }

    // =====================================================
    // GET COMPLAINTS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getComplaintsByStatus(
        @PathVariable String status
    ) {

        if (
            !currentUserService
                .isManagementUser()
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "Access denied."
            );
        }

        String normalizedStatus =
            normalizeStatus(
                status
            );

        if (
            normalizedStatus == null
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Invalid complaint status."
            );
        }

        List<Complaint> complaints =
            complaintRepository
                .findByStatusOrderByCreatedAtDesc(
                    normalizedStatus
                );

        return ResponseEntity.ok(
            complaintListResponse(
                complaints
            )
        );
    }

    // =====================================================
    // GET COMPLAINT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(
        @PathVariable Long id
    ) {

        Optional<Complaint> optionalComplaint =
            complaintRepository
                .findById(
                    id
                );

        if (
            optionalComplaint.isEmpty()
        ) {
            return error(
                HttpStatus.NOT_FOUND,
                "Complaint not found."
            );
        }

        Complaint complaint =
            optionalComplaint.get();

        if (
            !canViewComplaint(
                complaint
            )
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "You do not have permission to view this complaint."
            );
        }

        return ResponseEntity.ok(
            complaintResponse(
                complaint
            )
        );
    }

    // =====================================================
    // ASSIGN / REASSIGN / UNASSIGN
    // ADMIN ONLY
    // =====================================================

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignComplaint(
        @PathVariable Long id,
        @RequestBody AssignComplaintRequest request
    ) {

        if (
            !currentUserService
                .isAdmin()
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "Only administrators can assign complaints."
            );
        }

        Optional<Complaint> optionalComplaint =
            complaintRepository
                .findById(
                    id
                );

        if (
            optionalComplaint.isEmpty()
        ) {
            return error(
                HttpStatus.NOT_FOUND,
                "Complaint not found."
            );
        }

        Complaint complaint =
            optionalComplaint.get();

        Long assignedUserId =
            request.getAssignedUserId();

        // =================================================
        // UNASSIGN
        // =================================================

        if (
            assignedUserId == null
        ) {

            complaint.setAssignedUser(
                null
            );

            if (
                "ASSIGNED".equalsIgnoreCase(
                    complaint.getStatus()
                )
            ) {
                complaint.setStatus(
                    "OPEN"
                );
            }

            Complaint saved =
                complaintRepository.save(
                    complaint
                );

            if (
                saved.getUser() != null
            ) {
                notificationService
                    .createNotification(
                        saved.getUser(),
                        "Complaint Assignment Updated",
                        "Your complaint " +
                            saved.getComplaintCode() +
                            " is currently unassigned.",
                        "STATUS_UPDATE",
                        saved.getId()
                    );
            }

            return ResponseEntity.ok(
                complaintResponse(
                    saved
                )
            );
        }

        // =================================================
        // FIND STAFF / FACULTY
        // =================================================

        Optional<User> optionalUser =
            userRepository
                .findById(
                    assignedUserId
                );

        if (
            optionalUser.isEmpty()
        ) {
            return error(
                HttpStatus.NOT_FOUND,
                "Assigned user not found."
            );
        }

        User assignedUser =
            optionalUser.get();

        if (
            !assignedUser.isActive()
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Selected user is inactive."
            );
        }

        if (
            !isRole(
                assignedUser,
                "STAFF"
            ) &&
            !isRole(
                assignedUser,
                "FACULTY"
            )
        ) {
            return error(
                HttpStatus.BAD_REQUEST,
                "Complaint can only be assigned to Staff or Faculty."
            );
        }

        complaint.setAssignedUser(
            assignedUser
        );

        if (
            "OPEN".equalsIgnoreCase(
                complaint.getStatus()
            )
        ) {
            complaint.setStatus(
                "ASSIGNED"
            );
        }

        Complaint saved =
            complaintRepository.save(
                complaint
            );

        // Student notification
        if (
            saved.getUser() != null
        ) {
            notificationService
                .createNotification(
                    saved.getUser(),
                    "Complaint Assigned",
                    "Your complaint " +
                        saved.getComplaintCode() +
                        " has been assigned to " +
                        assignedUser.getName() +
                        ".",
                    "ASSIGNED",
                    saved.getId()
                );
        }

        // Staff / Faculty notification
        notificationService
            .createNotification(
                assignedUser,
                "New Complaint Assigned",
                "Complaint " +
                    saved.getComplaintCode() +
                    " has been assigned to you.",
                "ASSIGNED",
                saved.getId()
            );

        return ResponseEntity.ok(
            complaintResponse(
                saved
            )
        );
    }

    // =====================================================
    // UPDATE COMPLAINT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaint(
        @PathVariable Long id,
        @RequestBody UpdateComplaintRequest request
    ) {

        User currentUser =
            currentUserService
                .getCurrentUserOrNull();

        if (currentUser == null) {
            return error(
                HttpStatus.UNAUTHORIZED,
                "Authentication required."
            );
        }

        Optional<Complaint> optionalComplaint =
            complaintRepository
                .findById(
                    id
                );

        if (
            optionalComplaint.isEmpty()
        ) {
            return error(
                HttpStatus.NOT_FOUND,
                "Complaint not found."
            );
        }

        Complaint complaint =
            optionalComplaint.get();

        boolean admin =
            isRole(
                currentUser,
                "ADMIN"
            );

        boolean staffOrFaculty =
            isRole(
                currentUser,
                "STAFF"
            ) ||
            isRole(
                currentUser,
                "FACULTY"
            );

        if (
            !admin &&
            !staffOrFaculty
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "You do not have permission to update this complaint."
            );
        }

        // Staff / Faculty can update only assigned complaint
        if (
            staffOrFaculty &&
            !admin
        ) {

            if (
                complaint.getAssignedUser() == null ||
                !complaint
                    .getAssignedUser()
                    .getId()
                    .equals(
                        currentUser.getId()
                    )
            ) {
                return error(
                    HttpStatus.FORBIDDEN,
                    "You can update only complaints assigned to you."
                );
            }
        }

        String oldStatus =
            complaint.getStatus();

        // =================================================
        // ADMIN EDITABLE COMPLAINT DATA
        // =================================================

        if (admin) {

            if (
                request.getTitle() != null &&
                !request.getTitle().isBlank()
            ) {
                complaint.setTitle(
                    request
                        .getTitle()
                        .trim()
                );
            }

            if (
                request.getCategory() != null &&
                !request.getCategory().isBlank()
            ) {
                complaint.setCategory(
                    request
                        .getCategory()
                        .trim()
                );
            }

            if (
                request.getLocation() != null &&
                !request.getLocation().isBlank()
            ) {
                complaint.setLocation(
                    request
                        .getLocation()
                        .trim()
                );
            }

            if (
                request.getDescription() != null &&
                !request.getDescription().isBlank()
            ) {
                complaint.setDescription(
                    request
                        .getDescription()
                        .trim()
                );
            }

            if (
                request.getPriority() != null &&
                !request.getPriority().isBlank()
            ) {

                String priority =
                    normalizePriority(
                        request.getPriority()
                    );

                if (
                    priority == null
                ) {
                    return error(
                        HttpStatus.BAD_REQUEST,
                        "Invalid complaint priority."
                    );
                }

                complaint.setPriority(
                    priority
                );
            }
        }

        // =================================================
        // STATUS
        // =================================================

        if (
            request.getStatus() != null &&
            !request.getStatus().isBlank()
        ) {

            String newStatus =
                normalizeStatus(
                    request.getStatus()
                );

            if (
                newStatus == null
            ) {
                return error(
                    HttpStatus.BAD_REQUEST,
                    "Invalid complaint status."
                );
            }

            if (
                staffOrFaculty &&
                !admin &&
                !isAllowedStaffTransition(
                    oldStatus,
                    newStatus
                )
            ) {
                return error(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status workflow. Staff/Faculty can use ASSIGNED → IN_PROGRESS → RESOLVED."
                );
            }

            if (
                (
                    "RESOLVED".equals(
                        newStatus
                    ) ||
                    "CLOSED".equals(
                        newStatus
                    )
                ) &&
                (
                    request.getResolutionNote() == null ||
                    request
                        .getResolutionNote()
                        .isBlank()
                ) &&
                (
                    complaint.getResolutionNote() == null ||
                    complaint
                        .getResolutionNote()
                        .isBlank()
                )
            ) {
                return error(
                    HttpStatus.BAD_REQUEST,
                    "Resolution note is required before resolving or closing a complaint."
                );
            }

            complaint.setStatus(
                newStatus
            );

            updateResolvedTimestamp(
                complaint,
                newStatus
            );
        }

        // =================================================
        // RESOLUTION NOTE
        // =================================================

        if (
            request.getResolutionNote() != null
        ) {

            String resolutionNote =
                request
                    .getResolutionNote()
                    .trim();

            complaint.setResolutionNote(
                resolutionNote.isBlank()
                    ? null
                    : resolutionNote
            );
        }

        Complaint saved =
            complaintRepository.save(
                complaint
            );

        // =================================================
        // STATUS NOTIFICATION
        // =================================================

        if (
            oldStatus != null &&
            saved.getStatus() != null &&
            !oldStatus.equalsIgnoreCase(
                saved.getStatus()
            ) &&
            saved.getUser() != null
        ) {

            String notificationType =
                "RESOLVED".equals(
                    saved.getStatus()
                )
                    ? "RESOLVED"
                    : "STATUS_UPDATE";

            notificationService
                .createNotification(
                    saved.getUser(),
                    getStatusNotificationTitle(
                        saved.getStatus()
                    ),
                    "Complaint " +
                        saved.getComplaintCode() +
                        " status changed from " +
                        formatStatus(
                            oldStatus
                        ) +
                        " to " +
                        formatStatus(
                            saved.getStatus()
                        ) +
                        ".",
                    notificationType,
                    saved.getId()
                );
        }

        return ResponseEntity.ok(
            complaintResponse(
                saved
            )
        );
    }

    // =====================================================
    // DELETE COMPLAINT
    // ADMIN ONLY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(
        @PathVariable Long id
    ) {

        if (
            !currentUserService
                .isAdmin()
        ) {
            return error(
                HttpStatus.FORBIDDEN,
                "Only administrators can delete complaints."
            );
        }

        Optional<Complaint> complaint =
            complaintRepository
                .findById(
                    id
                );

        if (
            complaint.isEmpty()
        ) {
            return error(
                HttpStatus.NOT_FOUND,
                "Complaint not found."
            );
        }

        complaintRepository.delete(
            complaint.get()
        );

        Map<String, Object> response =
            new LinkedHashMap<>();

        response.put(
            "message",
            "Complaint deleted successfully."
        );

        return ResponseEntity.ok(
            response
        );
    }

    // =====================================================
    // CAN VIEW
    // =====================================================

    private boolean canViewComplaint(
        Complaint complaint
    ) {

        User currentUser =
            currentUserService
                .getCurrentUserOrNull();

        if (currentUser == null) {
            return false;
        }

        if (
            complaint.getUser() != null &&
            complaint
                .getUser()
                .getId()
                .equals(
                    currentUser.getId()
                )
        ) {
            return true;
        }

        if (
            complaint.getAssignedUser() != null &&
            complaint
                .getAssignedUser()
                .getId()
                .equals(
                    currentUser.getId()
                )
        ) {
            return true;
        }

        return currentUserService
            .isManagementUser();
    }

    // =====================================================
    // STAFF WORKFLOW
    // =====================================================

    private boolean isAllowedStaffTransition(
        String currentStatus,
        String newStatus
    ) {

        if (
            currentStatus == null ||
            newStatus == null
        ) {
            return false;
        }

        String current =
            currentStatus
                .toUpperCase(
                    Locale.ROOT
                );

        String next =
            newStatus
                .toUpperCase(
                    Locale.ROOT
                );

        if (
            current.equals(
                next
            )
        ) {
            return true;
        }

        if (
            "ASSIGNED".equals(
                current
            ) &&
            "IN_PROGRESS".equals(
                next
            )
        ) {
            return true;
        }

        return (
            "IN_PROGRESS".equals(
                current
            ) &&
            "RESOLVED".equals(
                next
            )
        );
    }

    // =====================================================
    // RESOLVED TIMESTAMP
    // =====================================================

    private void updateResolvedTimestamp(
        Complaint complaint,
        String status
    ) {

        if (
            "RESOLVED".equals(
                status
            )
        ) {

            if (
                complaint.getResolvedAt() ==
                null
            ) {
                complaint.setResolvedAt(
                    LocalDateTime.now()
                );
            }

        } else if (
            !"CLOSED".equals(
                status
            )
        ) {

            complaint.setResolvedAt(
                null
            );
        }
    }

    // =====================================================
    // PRIORITY NORMALIZER
    // =====================================================

    private String normalizePriority(
        String priority
    ) {

        if (
            priority == null ||
            priority.isBlank()
        ) {
            return "MEDIUM";
        }

        String value =
            priority
                .trim()
                .toUpperCase(
                    Locale.ROOT
                );

        return VALID_PRIORITIES.contains(
            value
        )
            ? value
            : null;
    }

    // =====================================================
    // STATUS NORMALIZER
    // =====================================================

    private String normalizeStatus(
        String status
    ) {

        if (
            status == null ||
            status.isBlank()
        ) {
            return null;
        }

        String value =
            status
                .trim()
                .toUpperCase(
                    Locale.ROOT
                )
                .replace(
                    " ",
                    "_"
                );

        return VALID_STATUSES.contains(
            value
        )
            ? value
            : null;
    }

    // =====================================================
    // ROLE CHECK
    // =====================================================

    private boolean isRole(
        User user,
        String role
    ) {

        return (
            user != null &&
            user.getRole() != null &&
            user.getRole()
                .equalsIgnoreCase(
                    role
                )
        );
    }

    // =====================================================
    // STATUS TITLE
    // =====================================================

    private String getStatusNotificationTitle(
        String status
    ) {

        if (
            "IN_PROGRESS".equals(
                status
            )
        ) {
            return "Complaint Work Started";
        }

        if (
            "RESOLVED".equals(
                status
            )
        ) {
            return "Complaint Resolved";
        }

        if (
            "CLOSED".equals(
                status
            )
        ) {
            return "Complaint Closed";
        }

        if (
            "ASSIGNED".equals(
                status
            )
        ) {
            return "Complaint Assigned";
        }

        return "Complaint Status Updated";
    }

    // =====================================================
    // STATUS FORMATTER
    // =====================================================

    private String formatStatus(
        String status
    ) {

        if (status == null) {
            return "";
        }

        return status.replace(
            "_",
            " "
        );
    }

    // =====================================================
    // COMPLAINT LIST RESPONSE
    // =====================================================

    private List<Map<String, Object>>
        complaintListResponse(
            List<Complaint> complaints
        ) {

        List<Map<String, Object>>
            response =
                new ArrayList<>();

        for (
            Complaint complaint :
            complaints
        ) {

            response.add(
                complaintResponse(
                    complaint
                )
            );
        }

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

        response.put(
            "user",
            complaint.getUser() != null
                ? safeUserResponse(
                    complaint.getUser()
                )
                : null
        );

        response.put(
            "assignedUser",
            complaint.getAssignedUser() != null
                ? safeUserResponse(
                    complaint.getAssignedUser()
                )
                : null
        );

        return response;
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

        // Keep userId for frontend compatibility
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

        return response;
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