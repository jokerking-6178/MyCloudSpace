package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.exception.AccessDeniedApiException;
import com.MyProject.MyCloudSpace.exception.BadRequestException;
import com.MyProject.MyCloudSpace.exception.ResourceNotFoundException;
import com.MyProject.MyCloudSpace.io.PaymentRequest;
import com.MyProject.MyCloudSpace.io.PaymentResultResponse;
import com.MyProject.MyCloudSpace.io.RazorpayOrderResponse;
import com.MyProject.MyCloudSpace.io.VerifyData;
import com.MyProject.MyCloudSpace.repository.PaymentRepository;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import com.MyProject.MyCloudSpace.service.RazorpayService;
import com.MyProject.MyCloudSpace.service.StorageTierService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final StorageTierService storageTierService;

    @Value("${razorpay.key}")
    private String razorpayKeyId;

    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of(
                "razorpayKeyId", razorpayKeyId,
                "currency", "INR");
    }

    @GetMapping("/quote")
    public Map<String, Object> quote(@RequestParam long storageGb) {
        if (storageGb < 10 || storageGb > 2000) {
            throw new BadRequestException("Storage must be between 10 GB and 2000 GB.");
        }
        long paise = storageTierService.priceInPaise(storageGb);
        return Map.of(
                "storageGb", storageGb,
                "amountInPaise", paise,
                "amountInRupees", paise / 100);
    }

    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public RazorpayOrderResponse createRazorpayOrder(@AuthenticationPrincipal AppUserPrincipal principal,
                                                     @Valid @RequestBody PaymentRequest request)
            throws RazorpayException {

        UserEntity user = userRepository.findById(principal.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", principal.getId()));

        long storageGb = request.getStorageGb();
        long amountInPaise = storageTierService.priceInPaise(storageGb);
        String currency = request.getCurrency() != null ? request.getCurrency() : "INR";

        RazorpayOrderResponse order = razorpayService.createOrder(amountInPaise, currency);

        storageTierService.recordPendingOrder(user, order.getId(), amountInPaise, storageGb);

        order.setStorageGb(storageGb);
        return order;
    }

    @PostMapping("/verify")
    public PaymentResultResponse verifyPayment(@AuthenticationPrincipal AppUserPrincipal principal,
                                               @Valid @RequestBody VerifyData verificationData) {

        PaymentEntity pending = paymentRepository.findByRazorpayOrderId(verificationData.getRazorpayOrderId())
                .orElseThrow(() -> ResourceNotFoundException.of("Order", verificationData.getRazorpayOrderId()));

        if (!pending.getUser().getId().equals(principal.getId())) {
            throw new AccessDeniedApiException("That order belongs to a different account.");
        }

        if (!razorpayService.isSignatureValid(verificationData)) {
            log.warn("Rejected payment with an invalid signature for order {}",
                    verificationData.getRazorpayOrderId());
            throw new BadRequestException("We could not verify that payment. No storage has been added.");
        }

        PaymentEntity completed = storageTierService.completeOrder(
                verificationData.getRazorpayOrderId(), verificationData.getRazorpayPaymentId());

        UserEntity user = userRepository.findById(principal.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("User", principal.getId()));

        return PaymentResultResponse.builder()
                .success(true)
                .message(completed.getStorageGb() + " GB added to your account.")
                .storageGbAdded(completed.getStorageGb())
                .totalStorageGb(storageTierService.getEffectiveMaxStorage(user))
                .build();
    }

    @GetMapping("/tiers")
    public List<Map<String, Object>> getMyTiers(@AuthenticationPrincipal AppUserPrincipal principal) {
        return storageTierService.getActiveTiers(principal.getId()).stream()
                .map(tier -> Map.<String, Object>of(
                        "id", tier.getId(),
                        "storageGb", tier.getStorageGb(),
                        "purchasedOn", String.valueOf(tier.getPurchasedOn()),
                        "expireOn", String.valueOf(tier.getExpireOn())))
                .toList();
    }
}
