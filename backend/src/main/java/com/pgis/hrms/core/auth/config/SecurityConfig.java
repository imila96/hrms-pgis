package com.pgis.hrms.core.auth.config;

import com.pgis.hrms.core.auth.service.JpaUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtFilter;
    private final JpaUserDetailsService uds; // if you wire a DaoAuthenticationProvider elsewhere
    private final PasswordEncoder encoder;   // kept for completeness

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(customAuthenticationEntryPoint())
                )
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers("/auth/**",
                                "/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs/**").permitAll()

                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public announcements
                        .requestMatchers(HttpMethod.GET, "/announcements/public").permitAll()

                        // Admin – Issues (admins can resolve)
                        .requestMatchers(HttpMethod.GET,   "/issues").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/issues/*/resolve").hasRole("ADMIN")

                        // Employee – Issues (ADMIN, HR, DIRECTOR also have access as they can view employee features)
                        .requestMatchers(HttpMethod.GET,  "/issues/my").hasAnyRole("EMPLOYEE", "ADMIN", "HR", "DIRECTOR")
                        .requestMatchers(HttpMethod.POST, "/issues").hasAnyRole("EMPLOYEE", "ADMIN", "HR", "DIRECTOR")

                        // Attendance - Employee features (all roles can access)
                        .requestMatchers("/attendance/me", "/attendance/me/state").hasAnyRole("EMPLOYEE", "ADMIN", "HR", "DIRECTOR")
                        .requestMatchers(HttpMethod.POST, "/attendance/punch").hasAnyRole("EMPLOYEE", "ADMIN", "HR", "DIRECTOR")

                        // Leave - Employee features (all roles can access)
                        .requestMatchers("/leave/my", "/leave/balance").hasAnyRole("EMPLOYEE", "ADMIN", "HR", "DIRECTOR")
                        .requestMatchers(HttpMethod.POST, "/leave").hasAnyRole("EMPLOYEE", "ADMIN", "HR", "DIRECTOR")

                        // Profile - Everyone can access their own profile
                        .requestMatchers("/profile/me", "/hr/employees/me").authenticated()

                        // Policies - Employee view (all roles can read)
                        .requestMatchers(HttpMethod.GET, "/policies/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/policies").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/policies/**").hasAnyRole("HR", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/policies/*/approve").hasRole("DIRECTOR")

                        // HR specific endpoints
                        .requestMatchers("/hr/**").hasAnyRole("HR", "ADMIN","DIRECTOR")

                        // Admin specific endpoints
                        .requestMatchers("/admin/**").hasRole("ADMIN")

                        // everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** AuthenticationManager for /auth/login flow */
    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Custom Authentication Entry Point
     * Returns 401 Unauthorized instead of 403 Forbidden for authentication failures
     */
    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) -> {
            response.setContentType("application/json");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Bad credentials\"}");
        };
    }

    /** CORS for React (adjust origin if needed) */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:3000"));
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}
