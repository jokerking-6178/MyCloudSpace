package com.MyProject.MyCloudSpace.io;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShareableLinkRequest {

    @NotNull(message = "An expiry is required")
    @Min(value = 60, message = "A link must be valid for at least 1 minute")
    @Max(value = 2_592_000L, message = "A link may not be valid for longer than 30 days")
    private Long expirySeconds;

    @Min(value = 1, message = "The download limit must be at least 1")
    @Max(value = 1000, message = "The download limit may not exceed 1000")
    private Integer maxDownloads;
}
