package com.RentalHub.Model;

public enum PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED,         // full refund after a cancellation
    DEPOSIT_SETTLED   // deposit returned minus any damage deduction
}