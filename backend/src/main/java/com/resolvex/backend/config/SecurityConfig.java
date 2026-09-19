package com.resolvex.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // ======================================================
    // PASSWORD ENCODER
    // ======================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // ======================================================
    // SECURITY FILTER CHAIN
    // ======================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // ==================================================
                // CORS
                // ==================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // ==================================================
                // CSRF
                // JWT API -> Disabled
                // ==================================================

                .csrf(csrf ->
                        csrf.disable()
                )

                // ==================================================
                // STATELESS SESSION
                // ==================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // ==================================================
                // AUTHORIZATION RULES
                // ==================================================

                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // PUBLIC HEALTH API
                        // ==========================================

                        .requestMatchers(
                                "/api/health"
                        )
                        .permitAll()

                        // ==========================================
                        // PUBLIC AUTH
                        //
                        // Register
                        // Login
                        // ==========================================

                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()

                        // ==========================================
                        // ADMIN APIs
                        //
                        // User Management
                        // Dashboard Statistics
                        // Analytics
                        // ==========================================

                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole(
                                "ADMIN"
                        )

                        // ==================================================
                        // CATEGORY MANAGEMENT
                        // ==================================================

                        // ------------------------------------------
                        // ADMIN - GET ALL CATEGORIES
                        // Includes active + inactive
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories/admin"
                        )
                        .hasRole(
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // ADMIN - CREATE CATEGORY
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/categories/**"
                        )
                        .hasRole(
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // ADMIN - UPDATE / ACTIVATE / DEACTIVATE
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/categories/**"
                        )
                        .hasRole(
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // ACTIVE CATEGORY LIST
                        // Any authenticated account
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories"
                        )
                        .authenticated()

                        // ==================================================
                        // COMPLAINT MANAGEMENT
                        // ==================================================

                        // ------------------------------------------
                        // STAFF / FACULTY
                        // MY ASSIGNED COMPLAINTS
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/complaints/assigned/me"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "FACULTY"
                        )

                        // ------------------------------------------
                        // ASSIGNABLE STAFF/FACULTY LIST
                        //
                        // Admin uses this for assignment.
                        // Management users may also read it.
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/complaints/assignable-users"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "FACULTY",
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // GET ALL COMPLAINTS
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/complaints"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "FACULTY",
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // GET COMPLAINTS BY STATUS
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/complaints/status/**"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "FACULTY",
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // CREATE COMPLAINT
                        // STUDENT ONLY
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/complaints"
                        )
                        .hasRole(
                                "STUDENT"
                        )

                        // ------------------------------------------
                        // ASSIGN / REASSIGN / UNASSIGN
                        // ADMIN ONLY
                        //
                        // IMPORTANT:
                        // This must be before the generic PUT rule.
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/complaints/*/assign"
                        )
                        .hasRole(
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // UPDATE COMPLAINT
                        //
                        // ADMIN:
                        // Can update any complaint.
                        //
                        // STAFF/FACULTY:
                        // Controller checks assigned_user_id
                        // before allowing update.
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/complaints/**"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "FACULTY",
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // DELETE COMPLAINT
                        // ADMIN ONLY
                        // ------------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/complaints/**"
                        )
                        .hasRole(
                                "ADMIN"
                        )

                        // ------------------------------------------
                        // OTHER COMPLAINT ROUTES
                        //
                        // Examples:
                        // GET /api/complaints/{id}
                        // GET /api/complaints/code/{code}
                        // GET /api/complaints/user/{userId}
                        //
                        // Controller performs ownership checks.
                        // ------------------------------------------

                        .requestMatchers(
                                "/api/complaints/**"
                        )
                        .authenticated()

                        // ==================================================
                        // USER PROFILE
                        // ==================================================

                        .requestMatchers(
                                "/api/users/**"
                        )
                        .authenticated()

                        // ==================================================
                        // NOTIFICATIONS
                        // ==================================================

                        .requestMatchers(
                                "/api/notifications/**"
                        )
                        .authenticated()

                        // ==================================================
                        // EVERYTHING ELSE
                        // ==================================================

                        .anyRequest()
                        .authenticated()
                )

                // ==================================================
                // JWT FILTER
                // ==================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // ======================================================
    // CORS CONFIGURATION
    // ======================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // ==================================================
        // FRONTEND ORIGINS
        // ==================================================

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                )
        );

        // ==================================================
        // HTTP METHODS
        // ==================================================

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // ==================================================
        // HEADERS
        // ==================================================

        configuration.setAllowedHeaders(
                List.of("*")
        );

        // ==================================================
        // EXPOSE AUTHORIZATION HEADER
        // ==================================================

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        // ==================================================
        // ALLOW CREDENTIALS
        // ==================================================

        configuration.setAllowCredentials(
                true
        );

        // ==================================================
        // REGISTER CORS
        // ==================================================

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}