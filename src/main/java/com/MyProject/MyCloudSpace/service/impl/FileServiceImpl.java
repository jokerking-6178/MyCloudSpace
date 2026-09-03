package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.exception.AccessDeniedApiException;
import com.MyProject.MyCloudSpace.exception.BadRequestException;
import com.MyProject.MyCloudSpace.exception.QuotaExceededException;
import com.MyProject.MyCloudSpace.exception.ResourceNotFoundException;
import com.MyProject.MyCloudSpace.io.FileMetadataDTO;
import com.MyProject.MyCloudSpace.io.FileUploadResponse;
import com.MyProject.MyCloudSpace.repository.FileRepository;
import com.MyProject.MyCloudSpace.repository.ShareableLinkRepository;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.FileService;
import com.MyProject.MyCloudSpace.service.RagService;
import com.MyProject.MyCloudSpace.service.StorageTierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private static final long GB = 1024L * 1024L * 1024L;
    private static final String FALLBACK_CONTENT_TYPE = "application/octet-stream";

    private final S3Service s3Service;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final StorageTierService storageTierService;
    private final ShareableLinkRepository shareableLinkRepository;
    private final RagService ragService;

    @Override
    @Transactional
    public FileUploadResponse uploadFile(MultipartFile file, String userId, String description, String tags)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Choose a file to upload.");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("That file has no name.");
        }
        String fileName = sanitizeFileName(originalName);

        UserEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        long maxStorageBytes = storageTierService.getEffectiveMaxStorage(user) * GB;
        if (user.getStorageUsed() + file.getSize() > maxStorageBytes) {
            throw new QuotaExceededException(
                    "This upload would exceed your storage quota. Free up space or add more storage.");
        }

        String s3Key = s3Service.uploadFile(file, fileName);

        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(fileName);
        fileEntity.setS3Key(s3Key);
        fileEntity.setContentType(resolveContentType(file.getContentType()));
        fileEntity.setFileSize(file.getSize());
        fileEntity.setUploadedBy(user);
        fileEntity.setUploadedAt(LocalDateTime.now());
        fileEntity.setLastModified(LocalDateTime.now());
        fileEntity.setDescription(description);
        fileEntity.setTags(tags);
        fileEntity.setIsPublic(false);

        FileEntity savedFile = fileRepository.save(fileEntity);

        user.setStorageUsed(user.getStorageUsed() + file.getSize());
        userRepository.save(user);

        log.info("File uploaded: fileId={} userId={}", savedFile.getId(), userId);

        return new FileUploadResponse(
                savedFile.getId(),
                savedFile.getFileName(),
                savedFile.getS3Key(),
                null,
                "File uploaded successfully",
                savedFile.getFileSize(),
                savedFile.getUploadedAt());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileMetadataDTO> getUserFiles(String userId) {
        UserEntity user = getUserOrThrow(userId);
        return fileRepository.findByUploadedByOrderByUploadedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileMetadataDTO> searchUserFiles(String userId, String query) {
        if (query == null || query.isBlank()) {
            return getUserFiles(userId);
        }
        UserEntity user = getUserOrThrow(userId);
        return fileRepository
                .findByUploadedByAndFileNameContainingIgnoreCaseOrderByUploadedAtDesc(user, query.trim())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FileMetadataDTO getFileMetadata(Long fileId, String userId) {
        FileEntity file = getFileOrThrow(fileId);
        requireReadAccess(file, userId);
        FileMetadataDTO dto = convertToDTO(file);
        dto.setDownloadUrl(s3Service.generatePresignedUrl(file.getS3Key()));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadedFile downloadFile(Long fileId, String userId) {
        FileEntity file = getFileOrThrow(fileId);
        requireReadAccess(file, userId);
        return new DownloadedFile(
                s3Service.downloadFile(file.getS3Key()),
                file.getFileName(),
                file.getContentType());
    }

    @Override
    @Transactional
    public void deleteFile(Long fileId, String userId) {
        FileEntity file = getFileOrThrow(fileId);

        if (!file.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedApiException("You can only delete your own files.");
        }

        UserEntity owner = file.getUploadedBy();
        long releasedBytes = file.getFileSize() != null ? file.getFileSize() : 0L;
        String s3Key = file.getS3Key();

        shareableLinkRepository.deleteByFileId(fileId);

        for (UserEntity sharedWith : List.copyOf(file.getSharedWith())) {
            sharedWith.getSharedFiles().remove(file);
            userRepository.save(sharedWith);
        }
        file.getSharedWith().clear();

        try {
            ragService.deleteFileVectors(fileId);
        } catch (RuntimeException e) {
            log.error("Could not delete embeddings for fileId={}", fileId, e);
        }

        fileRepository.delete(file);
        fileRepository.flush();

        owner.setStorageUsed(Math.max(0L, owner.getStorageUsed() - releasedBytes));
        userRepository.save(owner);

        s3Service.deleteFile(s3Key);

        log.info("File deleted: fileId={} userId={}", fileId, userId);
    }

    @Override
    @Transactional
    public void shareFile(Long fileId, String ownerId, String shareWithEmail) {
        FileEntity file = getFileOrThrow(fileId);

        if (!file.getUploadedBy().getId().equals(ownerId)) {
            throw new AccessDeniedApiException("You can only share your own files.");
        }

        String email = shareWithEmail.trim().toLowerCase();
        if (email.equalsIgnoreCase(file.getUploadedBy().getEmail())) {
            throw new BadRequestException("That file already belongs to you.");
        }

        UserEntity shareWithUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account is registered with that email."));

        if (!file.getSharedWith().contains(shareWithUser)) {
            shareWithUser.getSharedFiles().add(file);
            file.getSharedWith().add(shareWithUser);
            userRepository.save(shareWithUser);
            fileRepository.save(file);
            log.info("File {} shared with user {}", fileId, shareWithUser.getId());
        }
    }

    @Override
    @Transactional
    public void unshareFile(Long fileId, String ownerId, String unshareWithEmail) {
        FileEntity file = getFileOrThrow(fileId);

        if (!file.getUploadedBy().getId().equals(ownerId)) {
            throw new AccessDeniedApiException("You can only manage sharing on your own files.");
        }

        UserEntity target = userRepository.findByEmail(unshareWithEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No account is registered with that email."));

        if (file.getSharedWith().remove(target)) {
            target.getSharedFiles().remove(file);
            userRepository.save(target);
            fileRepository.save(file);
            log.info("File {} unshared from user {}", fileId, target.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileMetadataDTO> getSharedFiles(String userId) {
        UserEntity user = getUserOrThrow(userId);
        return user.getSharedFiles().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSharedWithEmails(Long fileId, String ownerId) {
        FileEntity file = getFileOrThrow(fileId);
        if (!file.getUploadedBy().getId().equals(ownerId)) {
            throw new AccessDeniedApiException("You can only manage sharing on your own files.");
        }
        return file.getSharedWith().stream().map(UserEntity::getEmail).toList();
    }


    private UserEntity getUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }

    private FileEntity getFileOrThrow(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> ResourceNotFoundException.of("File", fileId));
    }

    private void requireReadAccess(FileEntity file, String userId) {
        if (file.getUploadedBy().getId().equals(userId)) {
            return;
        }
        if (Boolean.TRUE.equals(file.getIsPublic())) {
            return;
        }
        boolean isShared = file.getSharedWith().stream()
                .anyMatch(user -> user.getId().equals(userId));
        if (!isShared) {
            throw new AccessDeniedApiException("You do not have access to this file.");
        }
    }

    private String sanitizeFileName(String name) {
        String cleaned = name.replace('\\', '/');
        int slash = cleaned.lastIndexOf('/');
        if (slash >= 0) {
            cleaned = cleaned.substring(slash + 1);
        }
        cleaned = cleaned.replaceAll("[\\p{Cntrl}\"]", "").trim();
        if (cleaned.isEmpty()) {
            throw new BadRequestException("That file name is not valid.");
        }
        return cleaned.length() > 255 ? cleaned.substring(0, 255) : cleaned;
    }

    private String resolveContentType(String declared) {
        if (declared == null || declared.isBlank()) {
            return FALLBACK_CONTENT_TYPE;
        }
        try {
            MediaType.parseMediaType(declared);
            return declared;
        } catch (InvalidMediaTypeException e) {
            return FALLBACK_CONTENT_TYPE;
        }
    }

    private FileMetadataDTO convertToDTO(FileEntity file) {
        FileMetadataDTO dto = new FileMetadataDTO();
        dto.setId(file.getId());
        dto.setFileName(file.getFileName());
        dto.setContentType(file.getContentType());
        dto.setFileSize(file.getFileSize());
        dto.setFileSizeFormatted(formatFileSize(file.getFileSize()));
        dto.setUploadedBy(file.getUploadedBy().getId());
        dto.setUploadedByEmail(file.getUploadedBy().getEmail());
        dto.setUploadedAt(file.getUploadedAt());
        dto.setLastModified(file.getLastModified());
        dto.setDescription(file.getDescription());
        dto.setTags(file.getTags());
        dto.setIsPublic(file.getIsPublic());
        dto.setDownloadUrl(null);
        return dto;
    }

    private String formatFileSize(Long bytes) {
        if (bytes == null) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.2f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.2f MB", bytes / (1024.0 * 1024));
        return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
    }
}
