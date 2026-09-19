package com.resolvex.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_users_email",
            columnNames = "email"
        ),
        @UniqueConstraint(
            name = "uk_users_university_id",
            columnNames = "university_id"
        )
    }
)
public class User {

    /* =====================================================
       PRIMARY KEY
    ===================================================== */

    @Id
    @GeneratedValue(
        strategy = GenerationType.IDENTITY
    )
    private Long id;

    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    @Column(
        nullable = false,
        length = 100
    )
    private String name;

    @Column(
        name = "university_id",
        nullable = false,
        unique = true,
        length = 50
    )
    private String universityId;

    @Column(
        nullable = false,
        unique = true,
        length = 150
    )
    private String email;

    @Column(
        length = 20
    )
    private String phone;

    /* =====================================================
       SANJIVANI UNIVERSITY INFORMATION
    ===================================================== */

    @Column(
        nullable = false,
        length = 30
    )
    private String role;

    @Column(
        length = 150
    )
    private String department;

    @Column(
        length = 150
    )
    private String program;

    @Column(
        name = "academic_year",
        length = 30
    )
    private String year;

    /* =====================================================
       SECURITY
    ===================================================== */

    @Column(
        nullable = false,
        length = 255
    )
    private String password;

    @Column(
        nullable = false
    )
    private boolean active = true;

    /* =====================================================
       TIMESTAMPS
    ===================================================== */

    @Column(
        name = "created_at",
        nullable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at"
    )
    private LocalDateTime updatedAt;

    /* =====================================================
       DEFAULT CONSTRUCTOR
    ===================================================== */

    public User() {
    }

    /* =====================================================
       JPA EVENTS
    ===================================================== */

    @PrePersist
    public void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt =
                LocalDateTime.now();
    }

    /* =====================================================
       GETTERS AND SETTERS
    ===================================================== */

    public Long getId() {
        return id;
    }

    public void setId(
            Long id) {

        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(
            String name) {

        this.name = name;
    }

    public String getUniversityId() {
        return universityId;
    }

    public void setUniversityId(
            String universityId) {

        this.universityId =
                universityId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email) {

        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(
            String phone) {

        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(
            String role) {

        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(
            String department) {

        this.department =
                department;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(
            String program) {

        this.program = program;
    }

    public String getYear() {
        return year;
    }

    public void setYear(
            String year) {

        this.year = year;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password) {

        this.password = password;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(
            boolean active) {

        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt =
                updatedAt;
    }
}