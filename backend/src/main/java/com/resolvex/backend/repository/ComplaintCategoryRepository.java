package com.resolvex.backend.repository;

import com.resolvex.backend.model.ComplaintCategory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintCategoryRepository
        extends JpaRepository<ComplaintCategory, Long> {

    boolean existsByNameIgnoreCase(
            String name
    );

    List<ComplaintCategory>
    findByActiveTrueOrderByNameAsc();

    List<ComplaintCategory>
    findAllByOrderByNameAsc();
}