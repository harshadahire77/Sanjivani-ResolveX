package com.resolvex.backend.dto;

public class UpdateComplaintRequest {

    private String title;

    private String category;

    private String location;

    private String description;

    private String priority;

    private String status;

    private String resolutionNote;

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

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
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(
        String location
    ) {
        this.location = location;
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
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
        String status
    ) {
        this.status = status;
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
}