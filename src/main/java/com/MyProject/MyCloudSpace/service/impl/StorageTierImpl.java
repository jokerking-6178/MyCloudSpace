package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.PaymentStatus;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.exception.ResourceNotFoundException;
import com.MyProject.MyCloudSpace.repository.PaymentRepository;
import com.MyProject.MyCloudSpace.service.StorageTierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageTierImpl implements StorageTierService {

    private final PaymentRepository paymentRepository;

    @Value("${app.pricing.rupees-per-gb:7}")
    private long rupeesPerGb;

    @Value("${app.pricing.tier-months:1}")
    private int tierMonths;

    @Override
    public long priceInPaise(long storageGb) {
        return storageGb * rupeesPerGb * 100L;
    }

    @Override
    @Transactional(readOnly = true)
    public long getEffectiveMaxStorage(UserEntity user) {
        long tierStorage = getActiveTiers(user.getId())
                .stream()
                .mapToLong(PaymentEntity::getStorageGb)
                .sum();
        return user.getBaseStorage() + tierStorage;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentEntity> getActiveTiers(String userId) {
        return paymentRepository
                .findByUserIdAndIsActiveTrueAndStatusAndExpireOnGreaterThanEqual(
                        userId, PaymentStatus.COMPLETED, LocalDate.now());
    }

    @Override
    @Transactional
    public PaymentEntity recordPendingOrder(UserEntity user, String razorpayOrderId,
                                            long amountInPaise, long storageGb) {
        PaymentEntity pending = PaymentEntity.builder()
                .user(user)
                .razorpayOrderId(razorpayOrderId)
                .amount((double) amountInPaise)
                .storageGb(storageGb)
                .purchasedOn(LocalDate.now())
                .expireOn(LocalDate.now().plusMonths(tierMonths))
                .status(PaymentStatus.PENDING)
                .isActive(false)
                .build();

        PaymentEntity saved = paymentRepository.save(pending);
        log.info("Pending order recorded: orderId={} userId={} storageGb={}",
                razorpayOrderId, user.getId(), storageGb);
        return saved;
    }

    @Override
    @Transactional
    public PaymentEntity completeOrder(String razorpayOrderId, String razorpayPaymentId) {
        PaymentEntity tier = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> ResourceNotFoundException.of("Order", razorpayOrderId));

        if (tier.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Order {} was already completed; ignoring duplicate confirmation", razorpayOrderId);
            return tier;
        }

        tier.setStatus(PaymentStatus.COMPLETED);
        tier.setRazorpayPaymentId(razorpayPaymentId);
        tier.setIsActive(true);
        tier.setPurchasedOn(LocalDate.now());
        tier.setExpireOn(LocalDate.now().plusMonths(tierMonths));

        PaymentEntity saved = paymentRepository.save(tier);
        log.info("Order {} completed: {}GB granted to user {}",
                razorpayOrderId, saved.getStorageGb(), saved.getUser().getId());
        return saved;
    }

    @Override
    @Scheduled(cron = "${app.pricing.expiry-cron:0 0 0 * * *}")
    @Transactional
    public void expireOldTiers() {
        List<PaymentEntity> expired =
                paymentRepository.findExpiredActiveTiers(LocalDate.now(), PaymentStatus.COMPLETED);

        if (expired.isEmpty()) {
            return;
        }

        for (PaymentEntity tier : expired) {
            tier.setIsActive(false);
        }
        paymentRepository.saveAll(expired);
        log.info("Deactivated {} expired storage tier(s)", expired.size());
    }
}
