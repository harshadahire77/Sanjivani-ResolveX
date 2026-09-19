package com.resolvex.backend.dto;

public class AssignComplaintRequest {

    private Long assignedUserId;

    public Long getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(
            Long assignedUserId
    ) {
        this.assignedUserId = assignedUserId;
    }
}