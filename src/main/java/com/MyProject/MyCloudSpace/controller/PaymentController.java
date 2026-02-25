package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.PaymentStatus;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.io.PaymentRequest;
import com.MyProject.MyCloudSpace.io.RazorpayOrderResponse;
import com.MyProject.MyCloudSpace.io.SavePayment;
import com.MyProject.MyCloudSpace.io.VerifyData;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.RazorpayService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;
    private final UserRepository userRepository;
    Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public RazorpayOrderResponse createRazorpayOrder(@RequestBody PaymentRequest request) throws RazorpayException {
        logger.info("asked to create order");
        return razorpayService.createOrder(request.getAmount(), request.getCurrency());
    }

    @PostMapping("/save")
    @ResponseStatus(HttpStatus.CREATED)
    public String savePayment(@RequestBody SavePayment request){
        UserEntity existingUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentEntity payment = PaymentEntity.builder()
                .razorpayOrderId(request.getRazorpayOrderId())
                .amount(request.getAmount())
                .purchasedOn(LocalDate.now())
                .expireOn(LocalDate.now().plusMonths(1)) //
                .status("success".equalsIgnoreCase(request.getStatus())
                        ? PaymentStatus.COMPLETED
                        : PaymentStatus.FAILED)
                .user(existingUser)
                .build();

        existingUser.setPaymentInfo(payment);

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            existingUser.setMaxStorage(existingUser.getMaxStorage() + 100L);
        }

        userRepository.save(existingUser);
        logger.info("payment saved for {}",existingUser.getUsername());
        return "Payment saved successfully for user: " + existingUser.getUsername();
    }

    @PostMapping("/verify")
    @ResponseStatus(HttpStatus.OK)
    public String verifyPayment(@RequestBody VerifyData verificationData){
        logger.info("asked to verify payment");
        return razorpayService.verifyPayment(verificationData);
    }
}
