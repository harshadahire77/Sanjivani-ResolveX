package com.resolvex.backend.controller;

import com.resolvex.backend.dto.CategoryRequest;
import com.resolvex.backend.model.ComplaintCategory;
import com.resolvex.backend.repository.ComplaintCategoryRepository;
import com.resolvex.backend.service.CurrentUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final ComplaintCategoryRepository categoryRepository;
    private final CurrentUserService currentUserService;

    public CategoryController(
            ComplaintCategoryRepository categoryRepository,
            CurrentUserService currentUserService
    ) {
        this.categoryRepository =
                categoryRepository;

        this.currentUserService =
                currentUserService;
    }

    // ======================================================
    // ACTIVE CATEGORIES
    // GET /api/categories
    // ALL AUTHENTICATED USERS
    // ======================================================

    @GetMapping
    public ResponseEntity<?> getActiveCategories() {

        List<Map<String, Object>> categories =
                categoryRepository
                        .findByActiveTrueOrderByNameAsc()
                        .stream()
                        .map(this::categoryResponse)
                        .toList();

        return ResponseEntity.ok(
                categories
        );
    }

    // ======================================================
    // ALL CATEGORIES
    // GET /api/categories/admin
    // ADMIN ONLY
    // ======================================================

    @GetMapping("/admin")
    public ResponseEntity<?> getAllCategories() {

        if (!currentUserService.isAdmin()) {
            return forbidden(
                    "Administrator access required."
            );
        }

        List<Map<String, Object>> categories =
                categoryRepository
                        .findAllByOrderByNameAsc()
                        .stream()
                        .map(this::categoryResponse)
                        .toList();

        return ResponseEntity.ok(
                categories
        );
    }

    // ======================================================
    // CREATE CATEGORY
    // POST /api/categories
    // ADMIN ONLY
    // ======================================================

    @PostMapping
    public ResponseEntity<?> createCategory(
            @RequestBody CategoryRequest request
    ) {

        if (!currentUserService.isAdmin()) {
            return forbidden(
                    "Only administrators can create categories."
            );
        }

        if (
                request.getName() == null
                ||
                request.getName().trim().isEmpty()
        ) {
            return badRequest(
                    "Category name is required."
            );
        }

        String name =
                request
                        .getName()
                        .trim();

        if (
                categoryRepository
                        .existsByNameIgnoreCase(name)
        ) {
            return badRequest(
                    "Category already exists."
            );
        }

        ComplaintCategory category =
                new ComplaintCategory();

        category.setName(
                name
        );

        category.setDescription(
                clean(
                        request.getDescription()
                )
        );

        category.setActive(
                true
        );

        ComplaintCategory saved =
                categoryRepository
                        .save(category);

        Map<String, Object> response =
                categoryResponse(saved);

        response.put(
                "message",
                "Category created successfully."
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ======================================================
    // UPDATE CATEGORY
    // PUT /api/categories/{id}
    // ADMIN ONLY
    // ======================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest request
    ) {

        if (!currentUserService.isAdmin()) {
            return forbidden(
                    "Only administrators can update categories."
            );
        }

        Optional<ComplaintCategory> optionalCategory =
                categoryRepository
                        .findById(id);

        if (optionalCategory.isEmpty()) {
            return notFound(
                    "Category not found."
            );
        }

        ComplaintCategory category =
                optionalCategory.get();

        if (
                request.getName() != null
        ) {

            String newName =
                    request
                            .getName()
                            .trim();

            if (newName.isEmpty()) {
                return badRequest(
                        "Category name cannot be empty."
                );
            }

            if (
                    !newName.equalsIgnoreCase(
                            category.getName()
                    )
                    &&
                    categoryRepository
                            .existsByNameIgnoreCase(
                                    newName
                            )
            ) {
                return badRequest(
                        "Another category with this name already exists."
                );
            }

            category.setName(
                    newName
            );
        }

        if (
                request.getDescription()
                        != null
        ) {
            category.setDescription(
                    clean(
                            request.getDescription()
                    )
            );
        }

        ComplaintCategory saved =
                categoryRepository
                        .save(category);

        Map<String, Object> response =
                categoryResponse(saved);

        response.put(
                "message",
                "Category updated successfully."
        );

        return ResponseEntity.ok(
                response
        );
    }

    // ======================================================
    // ACTIVATE CATEGORY
    // PUT /api/categories/{id}/activate
    // ======================================================

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateCategory(
            @PathVariable Long id
    ) {

        if (!currentUserService.isAdmin()) {
            return forbidden(
                    "Only administrators can activate categories."
            );
        }

        Optional<ComplaintCategory> optionalCategory =
                categoryRepository.findById(id);

        if (optionalCategory.isEmpty()) {
            return notFound(
                    "Category not found."
            );
        }

        ComplaintCategory category =
                optionalCategory.get();

        category.setActive(
                true
        );

        ComplaintCategory saved =
                categoryRepository.save(
                        category
                );

        Map<String, Object> response =
                categoryResponse(saved);

        response.put(
                "message",
                "Category activated successfully."
        );

        return ResponseEntity.ok(
                response
        );
    }

    // ======================================================
    // DEACTIVATE CATEGORY
    // PUT /api/categories/{id}/deactivate
    // ======================================================

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateCategory(
            @PathVariable Long id
    ) {

        if (!currentUserService.isAdmin()) {
            return forbidden(
                    "Only administrators can deactivate categories."
            );
        }

        Optional<ComplaintCategory> optionalCategory =
                categoryRepository.findById(id);

        if (optionalCategory.isEmpty()) {
            return notFound(
                    "Category not found."
            );
        }

        ComplaintCategory category =
                optionalCategory.get();

        category.setActive(
                false
        );

        ComplaintCategory saved =
                categoryRepository.save(
                        category
                );

        Map<String, Object> response =
                categoryResponse(saved);

        response.put(
                "message",
                "Category deactivated successfully."
        );

        return ResponseEntity.ok(
                response
        );
    }

    // ======================================================
    // RESPONSE
    // ======================================================

    private Map<String, Object> categoryResponse(
            ComplaintCategory category
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                category.getId()
        );

        response.put(
                "name",
                category.getName()
        );

        response.put(
                "description",
                category.getDescription()
        );

        response.put(
                "active",
                category.isActive()
        );

        response.put(
                "createdAt",
                category.getCreatedAt()
        );

        response.put(
                "updatedAt",
                category.getUpdatedAt()
        );

        return response;
    }

    // ======================================================
    // CLEAN TEXT
    // ======================================================

    private String clean(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String result =
                value.trim();

        return result.isEmpty()
                ? null
                : result;
    }

    // ======================================================
    // ERRORS
    // ======================================================

    private ResponseEntity<?> badRequest(
            String message
    ) {
        return ResponseEntity
                .badRequest()
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }

    private ResponseEntity<?> forbidden(
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

    private ResponseEntity<?> notFound(
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