package com.RentalHub.controller;


import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.RentalHub.Service.PaymentService;
import com.RentalHub.dto.DepositSettleRequest;
import com.RentalHub.dto.PaymentResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentService service;

    public AdminPaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping
    public List<PaymentResponse> all() {
        return service.listAll();
    }

    @PostMapping("/booking/{bookingId}/settle-deposit")
    public PaymentResponse settleDeposit(@PathVariable Long bookingId,
                                         @Valid @RequestBody DepositSettleRequest req,
                                         Authentication auth) {
        return service.settleDeposit(bookingId, req, auth.getName());
    }
}