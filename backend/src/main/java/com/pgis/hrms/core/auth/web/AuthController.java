package com.pgis.hrms.core.auth.web;

import com.pgis.hrms.core.auth.entity.*;
import com.pgis.hrms.core.auth.repository.*;
import com.pgis.hrms.core.auth.service.JwtService;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    // DEV helper to create one user
    @PostMapping("/register")
    public void register(@RequestBody RegisterRequest r) {
        User u = new User();
        u.setEmail(r.email());
        u.setPassword(encoder.encode(r.password()));
        u.getRoles().add(roleRepo.findByCode("EMPLOYEE").orElseThrow());
        userRepo.save(u);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest c) {
        Authentication a = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(c.email(), c.password()));
        var ud = (org.springframework.security.core.userdetails.User) a.getPrincipal();
        String token = jwt.generate(ud);
        List<String> roles = ud.getAuthorities()
                .stream().map(GrantedAuthority::getAuthority).toList();
        return new AuthResponse(token, roles);
    }

    // DTO records
    public record RegisterRequest(@Email String email, @Size(min=6) String password) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String accessToken, List<String> roles) {}
}
