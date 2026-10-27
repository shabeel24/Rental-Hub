package com.RentalHub.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.RentalHub.Service.UserService;
import com.RentalHub.dto.UserResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userService.listUsers();
    }

    @PatchMapping("/vendors/{id}/approve")
    public ResponseEntity<Map<String, String>> approveVendor(@PathVariable Long id, Authentication auth) {
        userService.approveVendor(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Vendor approved"));
    }
}