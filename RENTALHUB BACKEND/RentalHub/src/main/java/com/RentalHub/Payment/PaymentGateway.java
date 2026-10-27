package com.RentalHub.Payment;

import java.math.BigDecimal;

public interface PaymentGateway {

    record GatewayOrder(String orderId) {}

    /** Creates a payment order on the gateway for this amount. */
    GatewayOrder createOrder(BigDecimal amount, String receipt);

    /** True only if the gateway signature for this order and payment is genuine. */
    boolean verify(String orderId, String paymentId, String signature);

    /** Refunds part or all of a captured payment. Returns the gateway refund id. */
    String refund(String paymentId, BigDecimal amount);

    /** Public key the frontend needs to open the checkout (never the secret). */
    String publicKey();
}