package com.MyProject.MyCloudSpace.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@ToString(exclude = {"user"})
@EqualsAndHashCode(exclude = {"user"})
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_user", columnList = "user_id")
})
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

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