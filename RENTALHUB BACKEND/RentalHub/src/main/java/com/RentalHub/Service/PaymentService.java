package com.RentalHub.Service;

import com.RentalHub.Model.Booking;
import com.RentalHub.Model.BookingStatus;
import com.RentalHub.Model.Payment;
import com.RentalHub.Model.PaymentStatus;
import com.RentalHub.Payment.PaymentGateway;
import com.RentalHub.Repository.BookingRepository;
import com.RentalHub.Repository.PaymentRepository;
import com.RentalHub.dto.DepositSettleRequest;
import com.RentalHub.dto.PaymentOrderResponse;
import com.RentalHub.dto.PaymentResponse;
import com.RentalHub.dto.PaymentVerifyRequest;
import com.RentalHub.exception.ResourceNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository payments;
    private final BookingRepository bookings;
    private final PaymentGateway gateway;
    private final String currency;

    public PaymentService(PaymentRepository payments,
                          BookingRepository bookings,
                          PaymentGateway gateway,
                          @Value("${app.payment.currency:INR}") String currency) {
        this.payments = payments;
        this.bookings = bookings;
        this.gateway = gateway;
        this.currency = currency;
    }

    // Step 1: customer asks to pay for a booking -> create a gateway order
    @Transactional
    public PaymentOrderResponse initiate(Long bookingId, String email) {
        Booking b = findBooking(bookingId);
        requireOwner(b, email);
        if (b.getStatus() != BookingStatus.REQUESTED) {
            throw new IllegalArgumentException("Booking is not awaiting payment");
        }

        Payment p = payments.findByBookingId(bookingId).orElseGet(Payment::new);
        if (p.getStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Booking is already paid");
        }

        PaymentGateway.GatewayOrder order = gateway.createOrder(b.getTotalAmount(), "booking-" + b.getId());
        p.setBooking(b);
        p.setAmount(b.getTotalAmount());
        p.setStatus(PaymentStatus.PENDING);
        p.setGatewayOrderId(order.orderId());
        p.setGatewayPaymentId(null);
        payments.save(p);

        log.info("AUDIT payment initiated booking={} order={} amount={} by={}",
                b.getId(), order.orderId(), p.getAmount(), email);
        return new PaymentOrderResponse(p.getId(), order.orderId(), p.getAmount(), currency, gateway.publicKey());
    }

    // Step 2: after the gateway checkout, the frontend sends the proof; we verify it
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public PaymentResponse verify(PaymentVerifyRequest req, String email) {
        Payment p = payments.findByGatewayOrderId(req.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));
        requireOwner(p.getBooking(), email);

        if (p.getStatus() == PaymentStatus.PAID) {
            return PaymentResponse.from(p);   // safe to call twice
        }

        if (!gateway.verify(req.orderId(), req.gatewayPaymentId(), req.signature())) {
            p.setStatus(PaymentStatus.FAILED);
            payments.save(p);
            log.warn("AUDIT payment verification FAILED order={} by={}", req.orderId(), email);
            throw new IllegalArgumentException("Payment verification failed");
        }

        p.setStatus(PaymentStatus.PAID);
        p.setGatewayPaymentId(req.gatewayPaymentId());
        p.setPaidAt(LocalDateTime.now());
        payments.save(p);

        Booking b = p.getBooking();
        b.setStatus(BookingStatus.CONFIRMED);
        bookings.save(b);

        log.info("AUDIT payment PAID booking={} payment={} amount={} by={}",
                b.getId(), req.gatewayPaymentId(), p.getAmount(), email);
        return PaymentResponse.from(p);
    }

    // Customer cancels: refund everything if it was paid
    @Transactional
    public void refundIfPaid(Booking b) {
        payments.findByBookingId(b.getId())
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .ifPresent(p -> {
                    gateway.refund(p.getGatewayPaymentId(), p.getAmount());
                    p.setRefundedAmount(p.getAmount());
                    p.setStatus(PaymentStatus.REFUNDED);
                    p.setRefundedAt(LocalDateTime.now());
                    payments.save(p);
                    log.info("AUDIT payment REFUNDED booking={} amount={}", b.getId(), p.getAmount());
                });
    }

    // Admin: after the items come back, return the deposit minus any damage deduction
    @Transactional
    public PaymentResponse settleDeposit(Long bookingId, DepositSettleRequest req, String adminEmail) {
        Booking b = findBooking(bookingId);
        if (b.getStatus() != BookingStatus.RETURNED) {
            throw new IllegalArgumentException("Deposit can be settled only after the booking is RETURNED");
        }
        Payment p = payments.findByBookingId(bookingId)
                .filter(x -> x.getStatus() == PaymentStatus.PAID)
                .orElseThrow(() -> new IllegalArgumentException("No paid payment found for this booking"));

        BigDecimal deposit = b.getDepositAmount();
        BigDecimal deduction = req.deductionAmount();
        if (deduction.compareTo(deposit) > 0) {
            throw new IllegalArgumentException("Deduction cannot exceed the deposit of " + deposit);
        }
        if (deduction.signum() > 0 && (req.reason() == null || req.reason().isBlank())) {
            throw new IllegalArgumentException("A reason is required when deducting from the deposit");
        }

        BigDecimal refund = deposit.subtract(deduction);
        if (refund.signum() > 0) {
            gateway.refund(p.getGatewayPaymentId(), refund);
        }

        p.setDeductedAmount(deduction);
        p.setDeductionReason(req.reason());
        p.setRefundedAmount(refund);
        p.setRefundedAt(LocalDateTime.now());
        p.setStatus(PaymentStatus.DEPOSIT_SETTLED);
        payments.save(p);

        b.setStatus(BookingStatus.CLOSED);
        bookings.save(b);

        log.info("AUDIT deposit settled booking={} deposit={} deducted={} refunded={} by={}",
                b.getId(), deposit, deduction, refund, adminEmail);
        return PaymentResponse.from(p);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getForBooking(Long bookingId, String email, boolean admin) {
        Booking b = findBooking(bookingId);
        if (!admin) requireOwner(b, email);
        return payments.findByBookingId(bookingId)
                .map(PaymentResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("No payment for booking " + bookingId));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listAll() {
        return payments.findAllByOrderByIdDesc().stream().map(PaymentResponse::from).toList();
    }

    private Booking findBooking(Long id) {
        return bookings.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private void requireOwner(Booking b, String email) {
        if (!b.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("This booking belongs to another user");
        }
    }
}