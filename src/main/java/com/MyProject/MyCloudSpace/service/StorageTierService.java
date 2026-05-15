package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.Entity.PaymentEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;

import java.util.List;

public interface StorageTierService {

    public long getEffectiveMaxStorage(UserEntity user);
    public List<PaymentEntity> getActiveTiers(String userId);
    public PaymentEntity addTier(UserEntity user, String razorpayOrderId, Double amount, Long storageGb);
    public void expireOldTiers();
}
