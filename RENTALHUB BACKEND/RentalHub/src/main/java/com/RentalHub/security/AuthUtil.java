package com.RentalHub.security;

import org.springframework.security.core.Authentication;

public final class AuthUtil {

    private AuthUtil() {}

    public static boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}