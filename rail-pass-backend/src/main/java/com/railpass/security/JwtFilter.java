package com.railpass.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        System.out.println("Incoming Request: " + request.getMethod() + " " + request.getRequestURI());
        if (authHeader != null) {
            System.out.println("Authorization Header found: " + (authHeader.startsWith("Bearer ") ? "Bearer Token" : "Unknown Format"));
        } else {
            System.out.println("No Authorization Header found");
        }

        String email = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                logger.error("Error extracting email from token", e);
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String role = jwtUtil.extractRole(jwt);
            System.out.println("Token extracted - Email: " + email + ", Role: " + role);
            
            if (jwtUtil.validateToken(jwt, email) && role != null) {
                String authority = role.startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
                System.out.println("Setting Security Context with authority: " + authority);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority(authority.trim())));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.out.println("Token validation failed or role is null");
            }
        }
        filterChain.doFilter(request, response);
    }
}
