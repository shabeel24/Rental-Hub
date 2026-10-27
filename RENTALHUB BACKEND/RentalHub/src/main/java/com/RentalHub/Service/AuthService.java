package com.RentalHub.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.RentalHub.Model.Role;
import com.RentalHub.Model.User;
import com.RentalHub.Repository.UserRepository;
import com.RentalHub.dto.AuthResponse;
import com.RentalHub.dto.LoginRequest;
import com.RentalHub.dto.RegisterRequest;
import com.RentalHub.security.JwtService;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public String register(RegisterRequest req) {
        if (req.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be self-registered");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        // Vendors must be approved by an admin before they can log in
        user.setEnabled(req.getRole() != Role.VENDOR);

        userRepository.save(user);
        log.info("AUDIT user registered email={} role={} enabled={}",
                user.getEmail(), user.getRole(), user.isEnabled());

        return user.isEnabled()
                ? "Registration successful"
                : "Registration successful. Your vendor account is awaiting admin approval";
    }

    // Same login for users and admin; the role comes from the database
    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (RuntimeException e) {
            log.warn("AUDIT login failed email={} reason={}", req.getEmail(), e.getClass().getSimpleName());
            throw e;
        }

        User user = userRepository.findByEmail(req.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        log.info("AUDIT login success email={} role={}", user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}