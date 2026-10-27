package com.RentalHub.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
        @NotBlank(message = "orderId is required") String orderId,
        @NotBlank(message = "gatewayPaymentId is required") String gatewayPaymentId,
        @NotBlank(message = "signature is required") String signature) {
}