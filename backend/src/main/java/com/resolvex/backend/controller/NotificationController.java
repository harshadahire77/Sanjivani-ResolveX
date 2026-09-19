package com.resolvex.backend.controller;

import com.resolvex.backend.model.Notification;
import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.NotificationRepository;
import com.resolvex.backend.repository.UserRepository;
import com.resolvex.backend.service.CurrentUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository
            notificationRepository;

    private final UserRepository
            userRepository;

    private final CurrentUserService
            currentUserService;

    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public NotificationController(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService
    ) {

        this.notificationRepository =
                notificationRepository;

        this.userRepository =
                userRepository;

        this.currentUserService =
                currentUserService;
    }

    // ======================================================
    // GET USER NOTIFICATIONS
    // ======================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?>
    getUserNotifications(
            @PathVariable Long userId
    ) {

        ResponseEntity<?> accessCheck =
                checkUserAccess(
                        userId
                );

        if (accessCheck != null) {
            return accessCheck;
        }

        if (
                !userRepository
                        .existsById(userId)
        ) {

            return notFound(
                    "User not found."
            );
        }

        List<Map<String, Object>> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId
                        )
                        .stream()
                        .map(
                                this::notificationResponse
                        )
                        .toList();

        return ResponseEntity.ok(
                notifications
        );
    }

    // ======================================================
    // GET UNREAD NOTIFICATIONS
    // ======================================================

    @GetMapping(
            "/user/{userId}/unread"
    )
    public ResponseEntity<?>
    getUnreadNotifications(
            @PathVariable Long userId
    ) {

        ResponseEntity<?> accessCheck =
                checkUserAccess(
                        userId
                );

        if (accessCheck != null) {
            return accessCheck;
        }

        if (
                !userRepository
                        .existsById(userId)
        ) {

            return notFound(
                    "User not found."
            );
        }

        List<Map<String, Object>> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                userId
                        )
                        .stream()
                        .map(
                                this::notificationResponse
                        )
                        .toList();

        return ResponseEntity.ok(
                notifications
        );
    }

    // ======================================================
    // UNREAD COUNT
    // ======================================================

    @GetMapping(
            "/user/{userId}/unread-count"
    )
    public ResponseEntity<?>
    getUnreadCount(
            @PathVariable Long userId
    ) {

        ResponseEntity<?> accessCheck =
                checkUserAccess(
                        userId
                );

        if (accessCheck != null) {
            return accessCheck;
        }

        if (
                !userRepository
                        .existsById(userId)
        ) {

            return notFound(
                    "User not found."
            );
        }

        long count =
                notificationRepository
                        .countByUserIdAndReadFalse(
                                userId
                        );

        return ResponseEntity.ok(
                Map.of(
                        "unreadCount",
                        count
                )
        );
    }

    // ======================================================
    // MARK ONE NOTIFICATION AS READ
    // ======================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?>
    markAsRead(
            @PathVariable Long id
    ) {

        Optional<Notification>
                optionalNotification =
                notificationRepository
                        .findById(id);

        if (
                optionalNotification
                        .isEmpty()
        ) {

            return notFound(
                    "Notification not found."
            );
        }

        Notification notification =
                optionalNotification.get();

        Optional<User> currentUser =
                currentUserService
                        .getCurrentUser();

        if (currentUser.isEmpty()) {
            return unauthorized();
        }

        if (
                !notification
                        .getUser()
                        .getId()
                        .equals(
                                currentUser
                                        .get()
                                        .getId()
                        )
        ) {

            return forbidden(
                    "You cannot modify another user's notification."
            );
        }

        notification.setRead(
                true
        );

        Notification savedNotification =
                notificationRepository
                        .save(
                                notification
                        );

        Map<String, Object> response =
                notificationResponse(
                        savedNotification
                );

        response.put(
                "message",
                "Notification marked as read."
        );

        return ResponseEntity.ok(
                response
        );
    }

    // ======================================================
    // MARK ALL AS READ
    // ======================================================

    @PutMapping(
            "/user/{userId}/read-all"
    )
    public ResponseEntity<?>
    markAllAsRead(
            @PathVariable Long userId
    ) {

        ResponseEntity<?> accessCheck =
                checkUserAccess(
                        userId
                );

        if (accessCheck != null) {
            return accessCheck;
        }

        if (
                !userRepository
                        .existsById(userId)
        ) {

            return notFound(
                    "User not found."
            );
        }

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                userId
                        );

        for (
                Notification notification
                : notifications
        ) {

            notification.setRead(
                    true
            );
        }

        notificationRepository
                .saveAll(
                        notifications
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "All notifications marked as read."
                )
        );
    }

    // ======================================================
    // DELETE ONE NOTIFICATION
    // ======================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?>
    deleteNotification(
            @PathVariable Long id
    ) {

        Optional<Notification>
                optionalNotification =
                notificationRepository
                        .findById(id);

        if (
                optionalNotification
                        .isEmpty()
        ) {

            return notFound(
                    "Notification not found."
            );
        }

        Notification notification =
                optionalNotification.get();

        Optional<User> currentUser =
                currentUserService
                        .getCurrentUser();

        if (currentUser.isEmpty()) {
            return unauthorized();
        }

        if (
                !notification
                        .getUser()
                        .getId()
                        .equals(
                                currentUser
                                        .get()
                                        .getId()
                        )
        ) {

            return forbidden(
                    "You cannot delete another user's notification."
            );
        }

        notificationRepository
                .delete(
                        notification
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Notification deleted successfully."
                )
        );
    }

    // ======================================================
    // CLEAR ALL USER NOTIFICATIONS
    // ======================================================

    @Transactional
    @DeleteMapping(
            "/user/{userId}/clear"
    )
    public ResponseEntity<?>
    clearNotifications(
            @PathVariable Long userId
    ) {

        ResponseEntity<?> accessCheck =
                checkUserAccess(
                        userId
                );

        if (accessCheck != null) {
            return accessCheck;
        }

        if (
                !userRepository
                        .existsById(userId)
        ) {

            return notFound(
                    "User not found."
            );
        }

        notificationRepository
                .deleteByUserId(
                        userId
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Notifications cleared successfully."
                )
        );
    }

    // ======================================================
    // CHECK OWNERSHIP
    // ======================================================

    private ResponseEntity<?>
    checkUserAccess(
            Long userId
    ) {

        Optional<User> currentUser =
                currentUserService
                        .getCurrentUser();

        if (currentUser.isEmpty()) {

            return unauthorized();
        }

        if (
                !currentUser
                        .get()
                        .getId()
                        .equals(userId)
        ) {

            return forbidden(
                    "You cannot access another user's notifications."
            );
        }

        return null;
    }

    // ======================================================
    // SAFE NOTIFICATION RESPONSE
    // ======================================================

    private Map<String, Object>
    notificationResponse(
            Notification notification
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                notification.getId()
        );

        response.put(
                "userId",
                notification
                        .getUser()
                        .getId()
        );

        response.put(
                "title",
                notification.getTitle()
        );

        response.put(
                "message",
                notification.getMessage()
        );

        response.put(
                "type",
                notification.getType()
        );

        response.put(
                "complaintId",
                notification
                        .getComplaintId()
        );

        response.put(
                "read",
                notification.isRead()
        );

        response.put(
                "createdAt",
                notification.getCreatedAt()
        );

        return response;
    }

    // ======================================================
    // UNAUTHORIZED
    // ======================================================

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

    // ======================================================
    // FORBIDDEN
    // ======================================================

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

    // ======================================================
    // NOT FOUND
    // ======================================================

    private ResponseEntity<?>
    notFound(
            String message
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.NOT_FOUND
                )
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }
}