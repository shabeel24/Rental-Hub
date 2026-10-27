package com.RentalHub.Payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Demo gateway, active when app.payment.provider=mock (the default).
 * A payment is accepted when the paymentId starts with "pay_" and the signature is "MOCK_SUCCESS".
 */
@Component
@ConditionalOnProperty(name = "app.payment.provider", havingValue = "mock", matchIfMissing = true)
public class MockPaymentGateway implements PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentGateway.class);

    @Override
    public GatewayOrder createOrder(BigDecimal amount, String receipt) {
        String id = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        log.info("MOCK gateway order created id={} amount={} receipt={}", id, amount, receipt);
        return new GatewayOrder(id);
    }

    @Override
    public boolean verify(String orderId, String paymentId, String signature) {
        return paymentId != null && paymentId.startsWith("pay_") && "MOCK_SUCCESS".equals(signature);
    }

    @Override
    public String refund(String paymentId, BigDecimal amount) {
        String id = "rfnd_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        log.info("MOCK gateway refund id={} paymentId={} amount={}", id, paymentId, amount);
        return id;
    }

    @Override
    public String publicKey() {
        return "mock_key";
    }
}