package com.resolvex.backend.service;

import com.resolvex.backend.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${resolvex.jwt.secret}")
    private String jwtSecret;

    @Value("${resolvex.jwt.expiration}")
    private long jwtExpiration;

    // ======================================================
    // GENERATE JWT TOKEN
    // ======================================================

    public String generateToken(User user) {

        Date now =
                new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + jwtExpiration
                );

        return Jwts.builder()
                .subject(user.getEmail())

                .claim(
                        "userId",
                        user.getId()
                )

                .claim(
                        "name",
                        user.getName()
                )

                .claim(
                        "role",
                        user.getRole()
                )

                .issuedAt(now)

                .expiration(expiration)

                .signWith(
                        getSigningKey()
                )

                .compact();
    }

    // ======================================================
    // EXTRACT EMAIL
    // ======================================================

    public String extractEmail(
            String token
    ) {

        return extractClaims(token)
                .getSubject();
    }

    // ======================================================
    // EXTRACT USER ID
    // ======================================================

    public Long extractUserId(
            String token
    ) {

        Claims claims =
                extractClaims(token);

        Number userId =
                claims.get(
                        "userId",
                        Number.class
                );

        if (userId == null) {
            return null;
        }

        return userId.longValue();
    }

    // ======================================================
    // EXTRACT ROLE
    // ======================================================

    public String extractRole(
            String token
    ) {

        return extractClaims(token)
                .get(
                        "role",
                        String.class
                );
    }

    // ======================================================
    // CHECK TOKEN EXPIRATION
    // ======================================================

    public boolean isTokenValid(
            String token
    ) {

        try {

            Claims claims =
                    extractClaims(token);

            Date expiration =
                    claims.getExpiration();

            return expiration != null
                    &&
                    expiration.after(
                            new Date()
                    );

        } catch (Exception exception) {

            return false;
        }
    }

    // ======================================================
    // VALIDATE TOKEN AGAINST USER
    // ======================================================

    public boolean isTokenValid(
            String token,
            User user
    ) {

        try {

            String email =
                    extractEmail(token);

            return email != null
                    &&
                    email.equalsIgnoreCase(
                            user.getEmail()
                    )
                    &&
                    user.isActive()
                    &&
                    isTokenValid(token);

        } catch (Exception exception) {

            return false;
        }
    }

    // ======================================================
    // EXTRACT ALL CLAIMS
    // ======================================================

    private Claims extractClaims(
            String token
    ) {

        return Jwts.parser()
                .verifyWith(
                        getSigningKey()
                )
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ======================================================
    // JWT SIGNING KEY
    // ======================================================

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }
}