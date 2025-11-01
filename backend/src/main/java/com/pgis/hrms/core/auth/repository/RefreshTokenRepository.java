package com.pgis.hrms.core.auth.repository;

import com.pgis.hrms.core.auth.entity.RefreshToken;
import com.pgis.hrms.core.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUser(User user);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revokedAt = :revokedAt WHERE rt.user = :user")
    void revokeAllUserTokens(User user, LocalDateTime revokedAt);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
}
