package com.pgis.hrms.core.auth.service;

import com.pgis.hrms.core.auth.entity.RefreshToken;
import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepo;
    private final JwtService jwtService;

    /**
     * Create a new refresh token for user
     */
    @Transactional
    public RefreshToken createRefreshToken(User user, boolean rememberMe, HttpServletRequest request) {
        // Revoke all existing tokens for this user (single session per user)
        // Remove this if you want multi-device login
        refreshTokenRepo.revokeAllUserTokens(user, LocalDateTime.now());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setRememberMe(rememberMe);
        refreshToken.setCreatedAt(LocalDateTime.now());
        
        // Set expiration based on remember me
        long expirationMs = jwtService.getRefreshTokenExpirationMs(rememberMe);
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(expirationMs / 1000));

        // Store client info for security
        refreshToken.setIpAddress(getClientIP(request));
        refreshToken.setUserAgent(request.getHeader("User-Agent"));

        return refreshTokenRepo.save(refreshToken);
    }

    /**
     * Validate and retrieve refresh token
     */
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (!refreshToken.isActive()) {
            throw new RuntimeException("Refresh token is expired or revoked");
        }

        return refreshToken;
    }

    /**
     * Revoke a specific refresh token
     */
    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenRepo.findByToken(token).ifPresent(rt -> {
            rt.setRevokedAt(LocalDateTime.now());
            refreshTokenRepo.save(rt);
        });
    }

    /**
     * Revoke all tokens for a user (logout from all devices)
     */
    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepo.revokeAllUserTokens(user, LocalDateTime.now());
    }

    /**
     * Clean up expired tokens (runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepo.deleteExpiredTokens(LocalDateTime.now());
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
