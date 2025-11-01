package com.pgis.hrms.core.auth.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtService {

    @Value("${hrms.jwt.secret}")
    private String secret;

    // Access token: 15 minutes for security
    private static final long ACCESS_TOKEN_EXP_MS = 15 * 60 * 1000;
    
    // Refresh token: 7 days (or 30 days with remember me)
    private static final long REFRESH_TOKEN_EXP_MS = 7 * 24 * 60 * 60 * 1000;
    private static final long REFRESH_TOKEN_REMEMBER_ME_EXP_MS = 30 * 24 * 60 * 60 * 1000;

    /**
     * Generate access token (short-lived)
     */
    public String generateAccessToken(UserDetails user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ACCESS_TOKEN_EXP_MS);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("roles", user.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .claim("type", "access")
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate refresh token (long-lived)
     */
    public String generateRefreshToken(UserDetails user, boolean rememberMe) {
        Date now = new Date();
        long expMs = rememberMe ? REFRESH_TOKEN_REMEMBER_ME_EXP_MS : REFRESH_TOKEN_EXP_MS;
        Date exp = new Date(now.getTime() + expMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Legacy method for backward compatibility
     */
    public String generate(UserDetails user) {
        return generateAccessToken(user);
    }

    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secret.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getSubject();
        }
    }

    public boolean isValid(String token, UserDetails user) {
        try {
            return extractUsername(token).equals(user.getUsername()) && !isExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isExpired(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secret.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration()
                    .before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public Date getExpirationDate(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(secret.getBytes())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getExpiration();
        }
    }

    public long getAccessTokenExpirationMs() {
        return ACCESS_TOKEN_EXP_MS;
    }

    public long getRefreshTokenExpirationMs(boolean rememberMe) {
        return rememberMe ? REFRESH_TOKEN_REMEMBER_ME_EXP_MS : REFRESH_TOKEN_EXP_MS;
    }
}
