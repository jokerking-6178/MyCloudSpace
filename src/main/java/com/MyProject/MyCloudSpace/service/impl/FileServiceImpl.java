package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.io.FileMetadataDTO;
import com.MyProject.MyCloudSpace.io.FileUploadResponse;
import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.repository.FileRepository;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.FileService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final S3Service s3Service;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    Logger log = LoggerFactory.getLogger(FileServiceImpl.class);

    @Transactional
    public FileUploadResponse uploadFile(MultipartFile file, String userId, String description, String tags) throws IOException {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Step 2: Check storage quota (optional)
        long maxStorage = (user.getMaxStorage()) * 1024 * 1024 * 1024; // 10GB limit
        if (user.getStorageUsed() + file.getSize() > maxStorage) {
            throw new RuntimeException("Storage quota exceeded");
        }

        // Step 3: Upload to S3
        String s3Key = s3Service.uploadFile(file);

        // Step 4: Create and save file entity
        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(file.getOriginalFilename());
        fileEntity.setS3Key(s3Key);
        fileEntity.setContentType(file.getContentType());
        fileEntity.setFileSize(file.getSize());
        fileEntity.setUploadedBy(user);  // Set the user relationship
        fileEntity.setUploadedAt(LocalDateTime.now());
        fileEntity.setLastModified(LocalDateTime.now());
        fileEntity.setDescription(description);
        fileEntity.setTags(tags);
        fileEntity.setIsPublic(false);

        FileEntity savedFile = fileRepository.save(fileEntity);

        // Step 5: Update user's storage usage
        user.setStorageUsed(user.getStorageUsed() + file.getSize());
        userRepository.save(user);

        // Step 6: Generate presigned URL
        String downloadUrl = s3Service.generatePresignedUrl(s3Key);

        log.info("File uploaded: {} by user: {}", s3Key, user.getUsername());

        return new FileUploadResponse(
                savedFile.getId(),
                savedFile.getFileName(),
                savedFile.getS3Key(),
                downloadUrl,
                "File uploaded successfully",
                savedFile.getFileSize(),
                savedFile.getUploadedAt()
        );
    }

    public List<FileMetadataDTO> getUserFiles(String userId) {

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("users not found"));

        List<FileEntity> files = fileRepository.findByUploadedBy(user);
        return files.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FileMetadataDTO getFileMetadata(Long fileId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + fileId));
        return convertToDTO(file);
    }

    @Override
    public byte[] downloadFile(Long fileId, String userId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        if (!file.getUploadedBy().getId().equals(userId) && !file.getIsPublic()) {
            boolean isShared = file.getSharedWith().stream()
                    .anyMatch(user -> user.getId().equals(userId));
            if (!isShared) {
                throw new RuntimeException("Unauthorized: You don't have access to this file");
            }
        }

        return s3Service.downloadFile(file.getS3Key());
    }

    @Transactional
    public void deleteFile(Long fileId, String userId) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        // Security check: Only file owner can delete
        if (!file.getUploadedBy().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own files");
        }

        UserEntity user = file.getUploadedBy();
        user.setStorageUsed(user.getStorageUsed() - file.getFileSize());
        userRepository.save(user);
        // Delete from S3 first
        s3Service.deleteFile(file.getS3Key());

        // Then delete from database
        fileRepository.delete(file);

        log.info("File deleted: {} by {}", file.getS3Key(), user.getUsername());
    }


    @Override
    public void shareFile(Long fileId, String OwnerId, String shareWithEmail) {

        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("file not found"));

        if(!file.getUploadedBy().getId().equals(OwnerId)){
            throw new RuntimeException("unauthorized to perform this action");
        }

        UserEntity shareWithUser = userRepository.findByEmail(shareWithEmail)
                .orElseThrow(() -> new RuntimeException("User to share with not found"));

        if(!file.getSharedWith().contains(shareWithUser)){
            shareWithUser.getSharedFiles().add(file);
            file.getSharedWith().add(shareWithUser);
            userRepository.save(shareWithUser);
            fileRepository.save(file);
            log.info("file {} shared with user {}", file.getFileName(), shareWithUser.getUsername());
        }
    }

    @Override
    public List<FileMetadataDTO> getSharedFiles(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user not found"));

        return user.getSharedFiles().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    private FileMetadataDTO convertToDTO(FileEntity file) {
        FileMetadataDTO dto = new FileMetadataDTO();
        dto.setId(file.getId());
        dto.setFileName(file.getFileName());
        dto.setContentType(file.getContentType());
        dto.setFileSize(file.getFileSize());
        dto.setFileSizeFormatted(formatFileSize(file.getFileSize()));
        dto.setUploadedBy(file.getUploadedBy().getId());  // Get username from user entity
        dto.setUploadedByEmail(file.getUploadedBy().getEmail()); // Get email
        dto.setUploadedAt(file.getUploadedAt());
        dto.setLastModified(file.getLastModified());
        dto.setDescription(file.getDescription());
        dto.setTags(file.getTags());
        dto.setIsPublic(file.getIsPublic());
        dto.setDownloadUrl(s3Service.generatePresignedUrl(file.getS3Key()));

        return dto;
    }

    private String formatFileSize(Long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.2f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
