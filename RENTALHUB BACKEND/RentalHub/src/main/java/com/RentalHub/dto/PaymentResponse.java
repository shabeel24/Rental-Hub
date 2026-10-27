package com.RentalHub.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.RentalHub.Model.Payment;
import com.RentalHub.Model.PaymentStatus;

public record PaymentResponse(
        Long id, Long bookingId, BigDecimal amount, PaymentStatus status,
        String gatewayOrderId, String gatewayPaymentId,
        BigDecimal refundedAmount, BigDecimal deductedAmount, String deductionReason,
        LocalDateTime paidAt, LocalDateTime refundedAt) {

    public static PaymentResponse from(Payment p) {
        return new PaymentResponse(
                p.getId(), p.getBooking().getId(), p.getAmount(), p.getStatus(),
                p.getGatewayOrderId(), p.getGatewayPaymentId(),
                p.getRefundedAmount(), p.getDeductedAmount(), p.getDeductionReason(),
                p.getPaidAt(), p.getRefundedAt());
    }
}