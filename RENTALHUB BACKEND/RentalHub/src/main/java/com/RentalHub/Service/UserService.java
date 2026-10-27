package com.RentalHub.Service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.RentalHub.Model.Role;
import com.RentalHub.Model.User;
import com.RentalHub.Repository.UserRepository;
import com.RentalHub.dto.UserResponse;
import com.RentalHub.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    public void approveVendor(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getRole() != Role.VENDOR) {
            throw new IllegalArgumentException("User is not a vendor");
        }
        user.setEnabled(true);
        userRepository.save(user);
        log.info("AUDIT vendor approved id={} email={} by={}", user.getId(), user.getEmail(), adminEmail);
    }
}