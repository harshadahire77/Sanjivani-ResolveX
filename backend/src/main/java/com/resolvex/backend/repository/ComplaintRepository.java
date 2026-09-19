package com.resolvex.backend.repository;

import com.resolvex.backend.model.Complaint;
import com.resolvex.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    // ======================================================
    // FIND BY COMPLAINT CODE
    // ======================================================

    Optional<Complaint> findByComplaintCode(
            String complaintCode
    );

    boolean existsByComplaintCode(
            String complaintCode
    );

    // ======================================================
    // STUDENT COMPLAINTS
    // ======================================================

    List<Complaint> findByUserOrderByCreatedAtDesc(
            User user
    );

    List<Complaint> findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    // ======================================================
    // FILTER BY STATUS
    // ======================================================

    List<Complaint> findByStatusOrderByCreatedAtDesc(
            String status
    );

    // ======================================================
    // FILTER BY CATEGORY
    // ======================================================

    List<Complaint> findByCategoryOrderByCreatedAtDesc(
            String category
    );

    // ======================================================
    // FILTER BY PRIORITY
    // ======================================================

    List<Complaint> findByPriorityOrderByCreatedAtDesc(
            String priority
    );

    // ======================================================
    // USER + STATUS
    // ======================================================

    List<Complaint> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId,
            String status
    );

    // ======================================================
    // REAL ASSIGNED USER
    //
    // complaints.assigned_user_id -> users.id
    // ======================================================

    List<Complaint> findByAssignedUserIdOrderByCreatedAtDesc(
            Long assignedUserId
    );

    // ======================================================
    // ALL COMPLAINTS
    // ======================================================

    List<Complaint> findAllByOrderByCreatedAtDesc();

    // ======================================================
    // COUNTS
    // ======================================================

    long countByStatus(
            String status
    );

    long countByPriority(
            String priority
    );

    // ======================================================
    // RECENT COMPLAINTS
    // ======================================================

    List<Complaint> findTop5ByOrderByCreatedAtDesc();
}