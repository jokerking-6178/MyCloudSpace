package com.MyProject.MyCloudSpace.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponse {
    private Long fileId;
    private String fileName;
    private String s3Key;
    private String downloadUrl;
    private String message;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
