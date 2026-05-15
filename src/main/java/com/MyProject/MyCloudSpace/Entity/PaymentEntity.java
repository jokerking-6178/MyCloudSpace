package com.MyProject.MyCloudSpace.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Represents ONE storage tier purchased by a user.
 * A user can have multiple active tiers stacked on top of each other.
 * Each tier expires independently after 1 month — expiry of one does NOT
 * affect any other tier.
 */
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(exclude = {"user"})
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    private Double amount;

    @Column(name = "storage_gb", nullable = false)
    private Long storageGb;

    @Column(name = "purchased_on")
    private LocalDate purchasedOn;

    @Column(name = "expire_on")
    private LocalDate expireOn;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus status;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}