package com.RentalHub.Repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.RentalHub.Model.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);
    List<Payment> findAllByOrderByIdDesc();
}