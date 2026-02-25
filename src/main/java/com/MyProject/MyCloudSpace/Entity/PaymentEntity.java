package com.MyProject.MyCloudSpace.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @OneToOne(mappedBy = "paymentInfo")
    private UserEntity user;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    private Double amount;

    @Column(name = "purchased_on")
    private LocalDate purchasedOn;

    @Column(name = "expire_on")
    private LocalDate expireOn;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus status;
}
