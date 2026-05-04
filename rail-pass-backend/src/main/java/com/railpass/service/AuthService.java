package com.railpass.service;

import com.railpass.dto.AuthResponse;
import com.railpass.dto.LoginRequest;
import com.railpass.dto.SignupRequest;
import com.railpass.model.User;
import com.railpass.repository.UserRepository;
import com.railpass.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // Verify stored password format starts with $2a$ as per requirement
        if (!encodedPassword.startsWith("$2a$")) {
            throw new RuntimeException("Error: Password encoding failed to meet security standards ($2a$ format required)");
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getEmail()) // Using email as username
                .email(request.getEmail())
                .password(encodedPassword)
                .role("USER")
                .build();

        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
