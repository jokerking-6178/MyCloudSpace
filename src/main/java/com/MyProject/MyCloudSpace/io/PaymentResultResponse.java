package com.MyProject.MyCloudSpace.io;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResultResponse {
    private boolean success;
    private String message;
    private Long storageGbAdded;
    private Long totalStorageGb;
}
