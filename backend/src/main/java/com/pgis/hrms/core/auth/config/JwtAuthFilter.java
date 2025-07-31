package com.pgis.hrms.core.auth.config;

import com.pgis.hrms.core.auth.service.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final JpaUserDetailsService uds;



    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, java.io.IOException {

        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String email = jwt.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var ud = uds.loadUserByUsername(email);
                if (jwt.isValid(token, ud)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            ud, null, ud.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }
        chain.doFilter(req, res);
    }
}
