package com.RentalHub.dto;



import java.time.LocalDateTime;

import com.RentalHub.Model.User;

public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private boolean enabled;
    private LocalDateTime createdAt;

    public static UserResponse from(User u) {
        UserResponse r = new UserResponse();
        r.id = u.getId();
        r.fullName = u.getFullName();
        r.email = u.getEmail();
        r.role = u.getRole().name();
        r.enabled = u.isEnabled();
        r.createdAt = u.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public boolean isEnabled() { return enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}