package com.RentalHub.dto;



import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.RentalHub.Model.Booking;
import com.RentalHub.Model.BookingStatus;
import com.RentalHub.Model.PaymentStatus;

public record BookingResponse(
        Long id, Long equipmentId, String equipmentName, String customerEmail,
        int quantity, LocalDate startDate, LocalDate endDate, int days,
        BigDecimal rentAmount, BigDecimal depositAmount, BigDecimal totalAmount,
        BookingStatus status, PaymentStatus paymentStatus, LocalDateTime createdAt) {

    public static BookingResponse from(Booking b, PaymentStatus paymentStatus) {
        return new BookingResponse(
                b.getId(), b.getEquipment().getId(), b.getEquipment().getName(),
                b.getCustomer().getEmail(), b.getQuantity(), b.getStartDate(), b.getEndDate(),
                b.getDays(), b.getRentAmount(), b.getDepositAmount(), b.getTotalAmount(),
                b.getStatus(), paymentStatus, b.getCreatedAt());
    }
}