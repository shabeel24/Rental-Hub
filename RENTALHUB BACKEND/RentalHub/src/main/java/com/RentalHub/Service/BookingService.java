package com.RentalHub.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.RentalHub.Model.Booking;
import com.RentalHub.Model.BookingStatus;
import com.RentalHub.Model.Equipment;
import com.RentalHub.Model.Payment;
import com.RentalHub.Model.PaymentStatus;
import com.RentalHub.Model.User;
import com.RentalHub.Repository.BookingRepository;
import com.RentalHub.Repository.EquipmentRepository;
import com.RentalHub.Repository.PaymentRepository;
import com.RentalHub.Repository.UserRepository;
import com.RentalHub.dto.BookingRequest;
import com.RentalHub.dto.BookingResponse;
import com.RentalHub.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookings;
    private final UserRepository users;
    private final EquipmentRepository equipment;
    private final PaymentRepository payments;
    private final PaymentService paymentService;

    public BookingService(BookingRepository bookings, UserRepository users,
                          EquipmentRepository equipment, PaymentRepository payments,
                          PaymentService paymentService) {
        this.bookings = bookings;
        this.users = users;
        this.equipment = equipment;
        this.payments = payments;
        this.paymentService = paymentService;
    }

    @Transactional
    public BookingResponse create(BookingRequest req, String email) {
        User customer = users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Equipment item = equipment.findById(req.equipmentId())
                .filter(Equipment::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + req.equipmentId()));

        if (req.endDate().isBefore(req.startDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        // TODO next step: replace with the date-overlap availability check plus locking
        if (req.quantity() > item.getTotalStock()) {
            throw new IllegalArgumentException("Only " + item.getTotalStock() + " units exist for this item");
        }

        int days = (int) ChronoUnit.DAYS.between(req.startDate(), req.endDate()) + 1;
        BigDecimal qty = BigDecimal.valueOf(req.quantity());

        // Multi-day discount: 10% from 3 days, 15% from 7 days
        int discountPct = days >= 7 ? 15 : days >= 3 ? 10 : 0;
        BigDecimal gross = item.getPricePerDay().multiply(qty).multiply(BigDecimal.valueOf(days));
        BigDecimal discount = gross.multiply(BigDecimal.valueOf(discountPct))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal rent = gross.subtract(discount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deposit = item.getDepositAmount().multiply(qty).setScale(2, RoundingMode.HALF_UP);

        Booking b = new Booking();
        b.setCustomer(customer);
        b.setEquipment(item);
        b.setQuantity(req.quantity());
        b.setStartDate(req.startDate());
        b.setEndDate(req.endDate());
        b.setDays(days);
        b.setRentAmount(rent);
        b.setDepositAmount(deposit);
        b.setTotalAmount(rent.add(deposit));
        b.setStatus(BookingStatus.REQUESTED);
        bookings.save(b);

        log.info("AUDIT booking created id={} item={} qty={} days={} total={} by={}",
                b.getId(), item.getName(), req.quantity(), days, b.getTotalAmount(), email);
        return toResponse(b);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> mine(String email) {
        return bookings.findByCustomerEmailOrderByIdDesc(email).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> all() {
        return bookings.findAllByOrderByIdDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse get(Long id, String email, boolean admin) {
        Booking b = find(id);
        if (!admin && !b.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("This booking belongs to another user");
        }
        return toResponse(b);
    }

    @Transactional
    public BookingResponse cancel(Long id, String email) {
        Booking b = find(id);
        if (!b.getCustomer().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("This booking belongs to another user");
        }
        if (b.getStatus() != BookingStatus.REQUESTED && b.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("A booking in status " + b.getStatus() + " cannot be cancelled");
        }
        paymentService.refundIfPaid(b);
        b.setStatus(BookingStatus.CANCELLED);
        bookings.save(b);
        log.info("AUDIT booking cancelled id={} by={}", id, email);
        return toResponse(b);
    }

    // Admin: CONFIRMED -> PICKED_UP -> RETURNED (CLOSED happens when the deposit is settled)
    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus to, String adminEmail) {
        Booking b = find(id);
        boolean allowed =
                (b.getStatus() == BookingStatus.CONFIRMED && to == BookingStatus.PICKED_UP)
             || (b.getStatus() == BookingStatus.PICKED_UP && to == BookingStatus.RETURNED);
        if (!allowed) {
            throw new IllegalArgumentException("Cannot move a booking from " + b.getStatus() + " to " + to);
        }
        b.setStatus(to);
        bookings.save(b);
        log.info("AUDIT booking status id={} -> {} by={}", id, to, adminEmail);
        return toResponse(b);
    }

    private Booking find(Long id) {
        return bookings.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private BookingResponse toResponse(Booking b) {
        PaymentStatus ps = payments.findByBookingId(b.getId()).map(Payment::getStatus).orElse(null);
        return BookingResponse.from(b, ps);
    }
}