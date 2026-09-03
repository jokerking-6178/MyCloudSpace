package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.io.RazorpayOrderResponse;
import com.MyProject.MyCloudSpace.io.VerifyData;
import com.MyProject.MyCloudSpace.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {

    private static final String HMAC_SHA256 = "HmacSHA256";

    @Value("${razorpay.key}")
    private String razorpayKeyId;

    @Value("${razorpay.secret}")
    private String razorpayKeySecret;

    @Override
    public RazorpayOrderResponse createOrder(long amountInPaise, String currency) throws RazorpayException {
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        Order order = razorpayClient.orders.create(orderRequest);
        log.info("Razorpay order created: id={} amountPaise={}", order.get("id"), amountInPaise);

        return RazorpayOrderResponse.builder()
                .id(order.get("id"))
                .amount(((Number) order.get("amount")).longValue())
                .currency(order.get("currency"))
                .status(order.get("status"))
                .receipt(order.get("receipt"))
                .build();
    }

    @Override
    public boolean isSignatureValid(VerifyData data) {
        try {
            String payload = data.getRazorpayOrderId() + "|" + data.getRazorpayPaymentId();

            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            byte[] provided = HexFormat.of().parseHex(data.getRazorpaySignature().toLowerCase());

            return MessageDigest.isEqual(expected, provided);
        } catch (IllegalArgumentException e) {
            log.warn("Payment signature was not valid hex for order {}", data.getRazorpayOrderId());
            return false;
        } catch (Exception e) {
            log.error("Could not verify payment signature for order {}", data.getRazorpayOrderId(), e);
            return false;
        }
    }
}
