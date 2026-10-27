package com.RentalHub.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record DepositSettleRequest(
        @NotNull(message = "Deduction amount is required")
        @DecimalMin(value = "0.00", message = "Deduction cannot be negative") BigDecimal deductionAmount,
        @Size(max = 500, message = "Reason can be at most 500 characters") String reason) {
}