package com.resolvex.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "complaints"
)
public class Complaint {

    // ======================================================
    // PRIMARY KEY
    // ======================================================

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    // ======================================================
    // COMPLAINT CODE
    // Example: SU-CMP-A1B2C3D4
    // ======================================================

    @Column(
            name = "complaint_code",
            nullable = false,
            unique = true,
            length = 30
    )
    private String complaintCode;

    // ======================================================
    // COMPLAINT OWNER / STUDENT
    // ======================================================

    @ManyToOne(
            fetch = FetchType.EAGER,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // ======================================================
    // BASIC DETAILS
    // ======================================================

    @Column(
            nullable = false,
            length = 200
    )
    private String title;

    @Column(
            nullable = false,
            length = 100
    )
    private String category;

    @Column(
            nullable = false,
            length = 200
    )
    private String location;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String description;

    // ======================================================
    // PRIORITY
    // LOW / MEDIUM / HIGH / URGENT
    // ======================================================

    @Column(
            nullable = false,
            length = 30
    )
    private String priority = "MEDIUM";

    // ======================================================
    // STATUS
    //
    // OPEN
    // ASSIGNED
    // IN_PROGRESS
    // RESOLVED
    // CLOSED
    // ======================================================

    @Column(
            nullable = false,
            length = 30
    )
    private String status = "OPEN";

    // ======================================================
    // OLD ASSIGNMENT FIELD
    //
    // Kept temporarily so old frontend code still works.
    // Later this can be removed after full migration.
    // ======================================================

    @Column(
            name = "assigned_to",
            length = 200
    )
    private String assignedTo;

    // ======================================================
    // REAL ASSIGNED STAFF / FACULTY
    //
    // complaints.assigned_user_id
    //              ↓
    // users.id
    // ======================================================

    @ManyToOne(
            fetch = FetchType.EAGER
    )
    @JoinColumn(
            name = "assigned_user_id"
    )
    private User assignedUser;

    // ======================================================
    // RESOLUTION NOTE
    // ======================================================

    @Column(
            name = "resolution_note",
            columnDefinition = "TEXT"
    )
    private String resolutionNote;

    // ======================================================
    // TIMESTAMPS
    // ======================================================

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @Column(
            name = "resolved_at"
    )
    private LocalDateTime resolvedAt;

    // ======================================================
    // BEFORE INSERT
    // ======================================================

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        if (
                complaintCode == null
                ||
                complaintCode.isBlank()
        ) {

            complaintCode =
                    "SU-CMP-"
                            +
                    UUID.randomUUID()
                            .toString()
                            .replace(
                                    "-",
                                    ""
                            )
                            .substring(
                                    0,
                                    8
                            )
                            .toUpperCase();
        }

        if (
                priority == null
                ||
                priority.isBlank()
        ) {
            priority = "MEDIUM";
        }

        if (
                status == null
                ||
                status.isBlank()
        ) {
            status = "OPEN";
        }

        createdAt = now;
        updatedAt = now;
    }

    // ======================================================
    // BEFORE UPDATE
    // ======================================================

    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    // ======================================================
    // GETTERS / SETTERS
    // ======================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getComplaintCode() {
        return complaintCode;
    }

    public void setComplaintCode(
            String complaintCode
    ) {
        this.complaintCode =
                complaintCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user
    ) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(
            String title
    ) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(
            String category
    ) {
        this.category =
                category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(
            String location
    ) {
        this.location =
                location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description =
                description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(
            String priority
    ) {
        this.priority =
                priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status
    ) {
        this.status =
                status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(
            String assignedTo
    ) {
        this.assignedTo =
                assignedTo;
    }

    public User getAssignedUser() {
        return assignedUser;
    }

    public void setAssignedUser(
            User assignedUser
    ) {
        this.assignedUser =
                assignedUser;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(
            String resolutionNote
    ) {
        this.resolutionNote =
                resolutionNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt =
                createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt =
                updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(
            LocalDateTime resolvedAt
    ) {
        this.resolvedAt =
                resolvedAt;
    }
}