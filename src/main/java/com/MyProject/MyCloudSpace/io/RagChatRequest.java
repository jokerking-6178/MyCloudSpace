package com.MyProject.MyCloudSpace.io;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RagChatRequest {

    @NotBlank(message = "A question is required")
    @Size(max = 2000, message = "That question is too long")
    private String question;

    private Long fileId;

    @Min(value = 1, message = "topK must be at least 1")
    @Max(value = 20, message = "topK may not exceed 20")
    private Integer topK;
}
