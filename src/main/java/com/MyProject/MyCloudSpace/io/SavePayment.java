package com.MyProject.MyCloudSpace.io;

import lombok.Data;

@Data
public class SavePayment {
    private String userId;
    private String razorpayOrderId;
    private Double amount;
    private String status;
    private Long storageGb;
}