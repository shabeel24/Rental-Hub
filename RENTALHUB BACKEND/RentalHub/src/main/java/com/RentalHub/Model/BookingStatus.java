package com.RentalHub.Model;

public enum BookingStatus {
    REQUESTED,   // created, waiting for payment
    CONFIRMED,   // paid
    PICKED_UP,
    RETURNED,
    CLOSED,      // deposit settled
    CANCELLED
}