package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.io.PaymentRequest;
import com.MyProject.MyCloudSpace.io.RazorpayOrderResponse;
import com.MyProject.MyCloudSpace.io.SavePayment;
import com.MyProject.MyCloudSpace.io.VerifyData;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.RazorpayService;
import com.MyProject.MyCloudSpace.service.StorageTierService;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService    razorpayService;
    private final UserRepository     userRepository;
    private final StorageTierService storageTierService;

    Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public RazorpayOrderResponse createRazorpayOrder(
            @RequestBody PaymentRequest request) throws RazorpayException {
        logger.info("Creating Razorpay order");
        return razorpayService.createOrder(request.getAmount(), request.getCurrency());
    }

    @PostMapping("/save")
    @ResponseStatus(HttpStatus.CREATED)
    public String savePayment(@RequestBody SavePayment request) {
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"success".equalsIgnoreCase(request.getStatus())) {
            return "Payment was not successful — no storage added.";
        }

        long storageGb = request.getStorageGb() != null ? request.getStorageGb() : 10L;

        storageTierService.addTier(
                user,
                request.getRazorpayOrderId(),
                request.getAmount(),
                storageGb
        );

        long newTotal = storageTierService.getEffectiveMaxStorage(user);
        logger.info("Tier added for {}. Total effective storage: {}GB",
                user.getUsername(), newTotal);

        return "Storage tier of " + storageGb + "GB added successfully. " +
                "Total effective storage: " + newTotal + "GB";
    }

    @PostMapping("/verify")
    @ResponseStatus(HttpStatus.OK)
    public String verifyPayment(@RequestBody VerifyData verificationData) {
        logger.info("Verifying payment");
        return razorpayService.verifyPayment(verificationData);
    }

    @GetMapping("/tiers/{userId}")
    public Object getUserTiers(@PathVariable String userId) {
        return storageTierService.getActiveTiers(userId);
    }
}