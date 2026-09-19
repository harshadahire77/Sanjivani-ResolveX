package com.resolvex.backend.config;

import com.resolvex.backend.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

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
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // -----------------------------------------
                // CORS
                // -----------------------------------------
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // -----------------------------------------
                // CSRF
                // JWT API does not use server-side sessions
                // -----------------------------------------
                .csrf(
                        AbstractHttpConfigurer::disable
                )

                // -----------------------------------------
                // STATELESS SESSION
                // -----------------------------------------
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // -----------------------------------------
                // ROUTE SECURITY
                // -----------------------------------------
                .authorizeHttpRequests(auth ->
                        auth

                                // Allow CORS preflight requests
                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()

                                // Health endpoint
                                .requestMatchers(
                                        "/api/health"
                                )
                                .permitAll()

                                // Login / signup
                                .requestMatchers(
                                        "/api/auth/login",
                                        "/api/auth/signup",
                                        "/api/auth/register"
                                )
                                .permitAll()

                                // Allow Spring error endpoint
                                .requestMatchers(
                                        "/error"
                                )
                                .permitAll()

                                // Everything else requires JWT
                                .anyRequest()
                                .authenticated()
                )

                // -----------------------------------------
                // JWT FILTER
                // -----------------------------------------
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // -------------------------------------------------
        // FRONTENDS ALLOWED TO CALL THE BACKEND
        // -------------------------------------------------

        configuration.setAllowedOrigins(
                List.of(
                        // Local Vite
                        "http://localhost:5173",

                        // Local Vite alternative
                        "http://127.0.0.1:5173",

                        // Production Vercel frontend
                        "https://sanjivani-resolve-x.vercel.app"
                )
        );

        // -------------------------------------------------
        // HTTP METHODS
        // -------------------------------------------------

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

        // -------------------------------------------------
        // REQUEST HEADERS
        // -------------------------------------------------

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        // -------------------------------------------------
        // RESPONSE HEADERS FRONTEND MAY ACCESS
        // -------------------------------------------------

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        // -------------------------------------------------
        // ALLOW AUTHENTICATED REQUESTS
        // -------------------------------------------------

        configuration.setAllowCredentials(true);

        // Browser may cache preflight response
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =====================================================
    // AUTHENTICATION MANAGER
    // =====================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }
}