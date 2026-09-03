package com.MyProject.MyCloudSpace.io;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Choose how much storage to buy")
    @Min(value = 10, message = "The minimum purchase is 10 GB")
    @Max(value = 2000, message = "The maximum purchase is 2000 GB")
    private Long storageGb;

    private String currency;
}
