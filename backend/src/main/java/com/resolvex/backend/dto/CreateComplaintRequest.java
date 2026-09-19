package com.resolvex.backend.dto;

public class CreateComplaintRequest {

    private Long userId;

    private String title;

    private String category;

    private String location;

    private String description;

    private String priority;

    public CreateComplaintRequest() {
    }

    // ======================================================
    // USER ID
    // ======================================================

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // ======================================================
    // TITLE
    // ======================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // ======================================================
    // CATEGORY
    // ======================================================

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // ======================================================
    // LOCATION
    // ======================================================

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    // ======================================================
    // DESCRIPTION
    // ======================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // ======================================================
    // PRIORITY
    // ======================================================

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}