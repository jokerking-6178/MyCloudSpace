package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.io.RazorpayOrderResponse;
import com.MyProject.MyCloudSpace.io.VerifyData;
import com.MyProject.MyCloudSpace.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {

    @Value("${razorpay.key}")
    private String razorpayKeyId;
    @Value("${razorpay.secret}")
    private String razorpayKeySecret;

    Logger logger = LoggerFactory.getLogger(RazorpayServiceImpl.class);

    @Override
    public RazorpayOrderResponse createOrder(Double amount, String currency) throws RazorpayException {
        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount * 100);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "order_rcptid_"+System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        Order order = razorpayClient.orders.create(orderRequest);
        logger.info("successfully created order {}", order);
        return convertToResponse(order);
    }


    @Override
    public String verifyPayment(VerifyData verificationData) {
        logger.info("verification created order {}", verificationData);
        return "";
    }

    private RazorpayOrderResponse convertToResponse(Order order) {
        return RazorpayOrderResponse.builder()
                .id(order.get("id"))
                .amount(order.get("amount"))
                .currency(order.get("currency"))
                .status(order.get("status"))
                .created_at(order.get("created_at"))
                .receipt(order.get("receipt"))
                .build();
    }
}
