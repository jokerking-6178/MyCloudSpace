package com.MyProject.MyCloudSpace.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.bucket.name}")
    private String bucketName;

    @Value("${aws.presigned-url-minutes:15}")
    private long presignedUrlMinutes;

    public String uploadFile(MultipartFile file, String safeFileName) throws IOException {
        String s3Key = generateUniqueKey(safeFileName);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .serverSideEncryption(ServerSideEncryption.AES256)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to S3: {}", s3Key);
            return s3Key;
        } catch (S3Exception e) {
            log.error("Error uploading file to S3", e);
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public byte[] downloadFile(String s3Key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            try (ResponseInputStream<GetObjectResponse> response = s3Client.getObject(getObjectRequest)) {
                return response.readAllBytes();
            }
        } catch (S3Exception | IOException e) {
            log.error("Error downloading file from S3: key={}", s3Key, e);
            throw new RuntimeException("Failed to download file from S3", e);
        }
    }

    public void deleteFile(String s3Key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted from S3: {}", s3Key);
        } catch (S3Exception e) {
            log.error("Error deleting file from S3: key={}", s3Key, e);
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    public String generatePresignedUrl(String s3Key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(presignedUrlMinutes))
                    .getObjectRequest(getObjectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            log.debug("Presigned URL generated for key={}", s3Key);
            return presignedRequest.url().toString();
        } catch (S3Exception e) {
            log.error("Error generating presigned URL: key={}", s3Key, e);
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    private String generateUniqueKey(String safeFileName) {
        return UUID.randomUUID() + "_" + safeFileName;
    }
}
