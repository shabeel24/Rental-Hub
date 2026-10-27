package com.RentalHub.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BookingRequest(
        @NotNull(message = "Equipment is required") Long equipmentId,
        @Min(value = 1, message = "Quantity must be at least 1") int quantity,
        @NotNull(message = "Start date is required")
        @FutureOrPresent(message = "Start date cannot be in the past") LocalDate startDate,
        @NotNull(message = "End date is required") LocalDate endDate) {
}