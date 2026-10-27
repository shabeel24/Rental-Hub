package com.RentalHub.controller;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.RentalHub.Model.BookingStatus;
import com.RentalHub.Service.BookingService;
import com.RentalHub.dto.BookingResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService service;

    public AdminBookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookingResponse> all() {
        return service.all();
    }

    // PATCH /api/admin/bookings/5/status?to=PICKED_UP   (then ?to=RETURNED)
    @PatchMapping("/{id}/status")
    public BookingResponse updateStatus(@PathVariable Long id,
                                        @RequestParam BookingStatus to,
                                        Authentication auth) {
        return service.updateStatus(id, to, auth.getName());
    }
}