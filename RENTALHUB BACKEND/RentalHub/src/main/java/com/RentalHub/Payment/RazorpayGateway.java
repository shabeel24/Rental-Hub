package com.RentalHub.Payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

/** Real gateway, active when app.payment.provider=razorpay. Amounts go to Razorpay in paise. */
@Component
@ConditionalOnProperty(name = "app.payment.provider", havingValue = "razorpay")
public class RazorpayGateway implements PaymentGateway {

    private final String keyId;
    private final String keySecret;
    private final String currency;
    private final RestClient client;

    public RazorpayGateway(@Value("${app.payment.razorpay.key-id}") String keyId,
                           @Value("${app.payment.razorpay.key-secret}") String keySecret,
                           @Value("${app.payment.currency:INR}") String currency) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.currency = currency;
        this.client = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeaders(h -> h.setBasicAuth(keyId, keySecret))
                .build();
    }

    @Override
    public GatewayOrder createOrder(BigDecimal amount, String receipt) {
        Map<String, Object> body = Map.of(
                "amount", toPaise(amount), "currency", currency, "receipt", receipt);
        Map<?, ?> res = client.post().uri("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body).retrieve().body(Map.class);
        return new GatewayOrder((String) res.get("id"));
    }

    // Razorpay signature = HMAC_SHA256(orderId + "|" + paymentId, keySecret), hex encoded
    @Override
    public boolean verify(String orderId, String paymentId, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(
                    mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String refund(String paymentId, BigDecimal amount) {
        Map<?, ?> res = client.post().uri("/payments/{id}/refund", paymentId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("amount", toPaise(amount))).retrieve().body(Map.class);
        return (String) res.get("id");
    }

    @Override
    public String publicKey() {
        return keyId;
    }

    private long toPaise(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
    }
}