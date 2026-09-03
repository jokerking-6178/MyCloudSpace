package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import java.util.List;

public interface StorageTierService {

    long getEffectiveMaxStorage(UserEntity user);

    List<PaymentEntity> getActiveTiers(String userId);

    PaymentEntity recordPendingOrder(UserEntity user, String razorpayOrderId, long amountInPaise, long storageGb);

    PaymentEntity completeOrder(String razorpayOrderId, String razorpayPaymentId);

    void expireOldTiers();

    long priceInPaise(long storageGb);
}
