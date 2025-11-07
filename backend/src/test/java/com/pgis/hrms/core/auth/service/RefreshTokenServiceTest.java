package com.pgis.hrms.core.auth.service;

import com.pgis.hrms.core.auth.entity.RefreshToken;
import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepo;

    @Mock
    private JwtService jwtService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;
    private RefreshToken testToken;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1);
        testUser.setEmail("test@example.com");

        testToken = new RefreshToken();
        testToken.setToken("test-token-123");
        testToken.setUser(testUser);
        testToken.setCreatedAt(LocalDateTime.now());
        testToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        testToken.setRememberMe(false);
    }
    

    @Test
    void validateRefreshToken_withValidToken_shouldReturnToken() {
        // Arrange
        when(refreshTokenRepo.findByToken("test-token-123")).thenReturn(Optional.of(testToken));

        // Act
        RefreshToken result = refreshTokenService.validateRefreshToken("test-token-123");

        // Assert
        assertNotNull(result);
        assertEquals(testToken, result);
        verify(refreshTokenRepo).findByToken("test-token-123");
    }

    @Test
    void validateRefreshToken_withInvalidToken_shouldThrowException() {
        // Arrange
        when(refreshTokenRepo.findByToken("invalid-token")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> refreshTokenService.validateRefreshToken("invalid-token"));
        assertEquals("Invalid refresh token", exception.getMessage());
    }

    @Test
    void validateRefreshToken_withExpiredToken_shouldThrowException() {
        // Arrange
        testToken.setExpiresAt(LocalDateTime.now().minusDays(1));
        when(refreshTokenRepo.findByToken("expired-token")).thenReturn(Optional.of(testToken));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> refreshTokenService.validateRefreshToken("expired-token"));
        assertEquals("Refresh token is expired or revoked", exception.getMessage());
    }

    @Test
    void revokeRefreshToken_shouldSetRevokedAt() {
        // Arrange
        when(refreshTokenRepo.findByToken("test-token-123")).thenReturn(Optional.of(testToken));
        when(refreshTokenRepo.save(any(RefreshToken.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        refreshTokenService.revokeRefreshToken("test-token-123");

        // Assert
        assertNotNull(testToken.getRevokedAt());
        verify(refreshTokenRepo).save(testToken);
    }

    @Test
    void revokeAllUserTokens_shouldRevokeAllTokensForUser() {
        // Act
        refreshTokenService.revokeAllUserTokens(testUser);

        // Assert
        verify(refreshTokenRepo).revokeAllUserTokens(eq(testUser), any(LocalDateTime.class));
    }

    @Test
    void cleanupExpiredTokens_shouldDeleteExpiredTokens() {
        // Act
        refreshTokenService.cleanupExpiredTokens();

        // Assert
        verify(refreshTokenRepo).deleteExpiredTokens(any(LocalDateTime.class));
    }
}
