package com.RentalHub.Repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.RentalHub.Model.Booking;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerEmailOrderByIdDesc(String email);
    List<Booking> findAllByOrderByIdDesc();
}