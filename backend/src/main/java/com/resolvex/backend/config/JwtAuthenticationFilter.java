package com.resolvex.backend.config;

import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.UserRepository;
import com.resolvex.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    // ======================================================
    // JWT FILTER
    // ======================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader(
                        "Authorization"
                );

        // ==================================================
        // NO TOKEN
        // ==================================================

        if (
                authorizationHeader == null
                ||
                !authorizationHeader.startsWith(
                        "Bearer "
                )
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // ==================================================
        // EXTRACT TOKEN
        // ==================================================

        String token =
                authorizationHeader
                        .substring(7)
                        .trim();

        if (token.isEmpty()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        try {

            // ==============================================
            // EXTRACT EMAIL FROM JWT
            // ==============================================

            String email =
                    jwtService.extractEmail(
                            token
                    );

            // ==============================================
            // AUTHENTICATE ONLY IF NOT ALREADY AUTHENTICATED
            // ==============================================

            if (
                    email != null
                    &&
                    !email.isBlank()
                    &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication()
                            == null
            ) {

                Optional<User> optionalUser =
                        userRepository
                                .findByEmail(
                                        email
                                                .trim()
                                                .toLowerCase()
                                );

                if (optionalUser.isPresent()) {

                    User user =
                            optionalUser.get();

                    // ======================================
                    // IMPORTANT SECURITY CHECK
                    //
                    // Existing JWT becomes unusable
                    // immediately after account deactivation.
                    // ======================================

                    if (
                            user.isActive()
                            &&
                            jwtService
                                    .isTokenValid(
                                            token,
                                            user
                                    )
                    ) {

                        String role =
                                user.getRole();

                        if (
                                role != null
                                &&
                                !role.isBlank()
                        ) {

                            role =
                                    role
                                            .trim()
                                            .toUpperCase();

                            SimpleGrantedAuthority authority =
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + role
                                    );

                            UsernamePasswordAuthenticationToken
                                    authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            user.getEmail(),
                                            null,
                                            List.of(
                                                    authority
                                            )
                                    );

                            authentication.setDetails(
                                    new WebAuthenticationDetailsSource()
                                            .buildDetails(
                                                    request
                                            )
                            );

                            SecurityContextHolder
                                    .getContext()
                                    .setAuthentication(
                                            authentication
                                    );
                        }
                    }
                }
            }

        } catch (Exception exception) {

            /*
             * Invalid / expired / malformed JWT:
             * clear authentication and allow Spring Security
             * to reject protected endpoints.
             */

            SecurityContextHolder
                    .clearContext();
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}