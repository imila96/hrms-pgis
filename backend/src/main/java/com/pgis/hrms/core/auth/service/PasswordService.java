package com.pgis.hrms.core.auth.service;

import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.RefreshTokenRepository;
import com.pgis.hrms.core.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Change user password
     * @param email User email
     * @param currentPassword Current password (for verification)
     * @param newPassword New password
     * @throws RuntimeException if current password is incorrect
     */
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        // Invalidate all refresh tokens for this user (logout from all devices)
        refreshTokenRepository.revokeAllUserTokens(user, LocalDateTime.now());
    }
}
