package com.RentalHub.controller;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.RentalHub.Service.PaymentService;
import com.RentalHub.dto.PaymentOrderResponse;
import com.RentalHub.dto.PaymentResponse;
import com.RentalHub.dto.PaymentVerifyRequest;
import com.RentalHub.security.AuthUtil;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/booking/{bookingId}/initiate")
    public PaymentOrderResponse initiate(@PathVariable Long bookingId, Authentication auth) {
        return service.initiate(bookingId, auth.getName());
    }

    @PostMapping("/verify")
    public PaymentResponse verify(@Valid @RequestBody PaymentVerifyRequest req, Authentication auth) {
        return service.verify(req, auth.getName());
    }

    @GetMapping("/booking/{bookingId}")
    public PaymentResponse forBooking(@PathVariable Long bookingId, Authentication auth) {
        return service.getForBooking(bookingId, auth.getName(), AuthUtil.isAdmin(auth));
    }
}