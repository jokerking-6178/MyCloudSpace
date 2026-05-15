package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.PaymentStatus;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.repository.PaymentRepository;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.StorageTierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final UserRepository    userRepository;

    public long getEffectiveMaxStorage(UserEntity user) {
        long tierStorage = getActiveTiers(user.getId())
                .stream()
                .mapToLong(PaymentEntity::getStorageGb)
                .sum();
        return user.getBaseStorage() + tierStorage;
    }

    public List<PaymentEntity> getActiveTiers(String userId) {
        return paymentRepository
                .findByUserIdAndIsActiveTrueAndStatusAndExpireOnGreaterThanEqual(
                        userId, PaymentStatus.COMPLETED, LocalDate.now());
    }

    @Transactional
    public PaymentEntity addTier(UserEntity user, String razorpayOrderId,
                                 Double amount, Long storageGb) {
        PaymentEntity tier = PaymentEntity.builder()
                .user(user)
                .razorpayOrderId(razorpayOrderId)
                .amount(amount)
                .storageGb(storageGb)
                .purchasedOn(LocalDate.now())
                .expireOn(LocalDate.now().plusMonths(1))
                .status(PaymentStatus.COMPLETED)
                .isActive(true)
                .build();

        PaymentEntity saved = paymentRepository.save(tier);
        log.info("Added {}GB tier for user {} — expires {}",
                storageGb, user.getUsername(), saved.getExpireOn());
        return saved;
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void expireOldTiers() {
        List<PaymentEntity> expired =
                paymentRepository.findExpiredActiveTiers(LocalDate.now(), PaymentStatus.COMPLETED);

        log.info("Expiry check: found {} expired tier(s)", expired.size());

        for (PaymentEntity tier : expired) {
            try {
                tier.setIsActive(false);
                paymentRepository.save(tier);
                log.info("Deactivated {}GB tier {} for user {}",
                        tier.getStorageGb(), tier.getId(),
                        tier.getUser().getUsername());
            } catch (Exception e) {
                log.error("Failed to deactivate tier {}: {}", tier.getId(), e.getMessage());
            }
        }
    }
}