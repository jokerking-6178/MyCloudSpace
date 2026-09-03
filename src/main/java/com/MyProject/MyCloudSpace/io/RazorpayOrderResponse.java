package com.MyProject.MyCloudSpace.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RazorpayOrderResponse {
    private String id;
    private Long amount;
    private String currency;
    private String status;
    private Long createdAt;
    private String receipt;
    private Long storageGb;
}
