package com.RentalHub.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.RentalHub.Service.BookingService;
import com.RentalHub.dto.BookingRequest;
import com.RentalHub.dto.BookingResponse;
import com.RentalHub.security.AuthUtil;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, auth.getName()));
    }

    @GetMapping
    public List<BookingResponse> mine(Authentication auth) {
        return service.mine(auth.getName());
    }

    @GetMapping("/{id}")
    public BookingResponse get(@PathVariable Long id, Authentication auth) {
        return service.get(id, auth.getName(), AuthUtil.isAdmin(auth));
    }

    @PostMapping("/{id}/cancel")
    public BookingResponse cancel(@PathVariable Long id, Authentication auth) {
        return service.cancel(id, auth.getName());
    }
}