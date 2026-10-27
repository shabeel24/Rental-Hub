package com.RentalHub.Repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.RentalHub.Model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}