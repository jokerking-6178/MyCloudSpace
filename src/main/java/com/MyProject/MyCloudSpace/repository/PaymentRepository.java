package com.MyProject.MyCloudSpace.repository;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {

    List<PaymentEntity> findByUserIdOrderByPurchasedOnDesc(String userId);
    @Query("SELECT p FROM PaymentEntity p WHERE p.isActive = true AND p.expireOn < :today AND p.status = :status")
    List<PaymentEntity> findExpiredActiveTiers(LocalDate today, PaymentStatus status);
    List<PaymentEntity> findByUserIdAndIsActiveTrueAndStatusAndExpireOnGreaterThanEqual(
            String userId, PaymentStatus status, LocalDate today);
}