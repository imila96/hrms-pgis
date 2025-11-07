package com.pgis.hrms.core.auth.web;

import com.pgis.hrms.core.auth.entity.*;
import com.pgis.hrms.core.auth.repository.*;
import com.pgis.hrms.core.auth.service.JwtService;
import com.pgis.hrms.core.auth.service.PasswordService;
import com.pgis.hrms.core.auth.service.RefreshTokenService;
import com.pgis.hrms.core.auth.web.dto.ChangePasswordRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final RefreshTokenService refreshTokenService;
    private final PasswordService passwordService;

    // DEV helper to create one user
    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest r) {
        User u = new User();
        u.setEmail(r.email());
        u.setPassword(encoder.encode(r.password()));
        userRepo.save(u);
    }

    /**
     * Login with Remember Me support
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        // Authenticate user
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        
        var userDetails = (org.springframework.security.core.userdetails.User) auth.getPrincipal();
        
        // Get user entity for refresh token
        User user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate access token (short-lived)
        String accessToken = jwt.generateAccessToken(userDetails);

        // Generate refresh token (long-lived, stored in DB)
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                user, 
                request.rememberMe() != null && request.rememberMe(), 
                httpRequest
        );

        // Get roles
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // Calculate token expiration times
        long accessTokenExpiresIn = jwt.getAccessTokenExpirationMs();
        long refreshTokenExpiresIn = jwt.getRefreshTokenExpirationMs(
                request.rememberMe() != null && request.rememberMe()
        );

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                roles,
                accessTokenExpiresIn,
                refreshTokenExpiresIn,
                request.rememberMe() != null && request.rememberMe()
        );
    }

    /**
     * Refresh access token using refresh token
     */
    @PostMapping("/refresh")
    public RefreshResponse refreshToken(@Valid @RequestBody RefreshRequest request) {
        // Validate refresh token
        RefreshToken refreshToken = refreshTokenService.validateRefreshToken(request.refreshToken());

        // Load user details
        User user = refreshToken.getUser();
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> "ROLE_" + role.getCode())
                        .toArray(String[]::new))
                .build();

        // Generate new access token
        String newAccessToken = jwt.generateAccessToken(userDetails);

        // Get roles
        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return new RefreshResponse(
                newAccessToken,
                roles,
                jwt.getAccessTokenExpirationMs()
        );
    }

    /**
     * Logout - revoke refresh token
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody LogoutRequest request) {
        refreshTokenService.revokeRefreshToken(request.refreshToken());
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * Validate if access token is still valid
     */
    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean isExpired = jwt.isExpired(token);
            return ResponseEntity.ok(new TokenValidationResponse(!isExpired, isExpired));
        }
        return ResponseEntity.ok(new TokenValidationResponse(false, true));
    }

    /**
     * Change password for authenticated user
     */
    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal
    ) {
        // Validate that new password and confirm password match
        if (!request.newPassword().equals(request.confirmPassword())) {
            return ResponseEntity.badRequest().body(
                    new MessageResponse("New password and confirmation do not match")
            );
        }

        try {
            String email = principal.getName();
            passwordService.changePassword(email, request.currentPassword(), request.newPassword());
            return ResponseEntity.ok(new MessageResponse("Password changed successfully. Please login again."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // DTO records
    public record RegisterRequest(@Email String email, @Size(min=6) String password) {}
    
    public record LoginRequest(
            @Email @NotBlank String email, 
            @NotBlank String password,
            Boolean rememberMe
    ) {}
    
    public record AuthResponse(
            String accessToken,
            String refreshToken,
            List<String> roles,
            long accessTokenExpiresIn,
            long refreshTokenExpiresIn,
            boolean rememberMe
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}
    
    public record RefreshResponse(
            String accessToken,
            List<String> roles,
            long expiresIn
    ) {}

    public record LogoutRequest(@NotBlank String refreshToken) {}
    
    public record MessageResponse(String message) {}
    
    public record TokenValidationResponse(boolean valid, boolean expired) {}
}
