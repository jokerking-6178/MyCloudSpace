package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.Entity.ShareableLinkEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.io.ShareableLinkRequest;
import com.MyProject.MyCloudSpace.io.ShareableLinkResponse;
import com.MyProject.MyCloudSpace.repository.FileRepository;
import com.MyProject.MyCloudSpace.repository.ShareableLinkRepository;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.ShareableLinkService;
import com.MyProject.MyCloudSpace.service.impl.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShareableLinkImpl implements ShareableLinkService {

    private final ShareableLinkRepository linkRepository;
    private final FileRepository          fileRepository;
    private final UserRepository          userRepository;
    private final S3Service               s3Service;

    @Transactional
    public ShareableLinkResponse createLink(Long fileId, String userId,
                                            ShareableLinkRequest request) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        boolean isOwner  = file.getUploadedBy().getId().equals(userId);
        boolean isShared = file.getSharedWith().stream()
                .anyMatch(u -> u.getId().equals(userId));

        if (!isOwner && !isShared) {
            throw new IllegalArgumentException(
                    "You don't have permission to create a shareable link for this file.");
        }

        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(request.getExpirySeconds());

        ShareableLinkEntity link = ShareableLinkEntity.builder()
                .token(UUID.randomUUID().toString().replace("-", ""))
                .file(file)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .maxDownloads(request.getMaxDownloads())
                .downloadCount(0)
                .isActive(true)
                .build();

        ShareableLinkEntity saved = linkRepository.save(link);
        log.info("Shareable link created: token={} fileId={} expiresAt={}",
                saved.getToken(), fileId, expiresAt);

        return toResponse(saved);
    }

    @Transactional
    public byte[] downloadViaToken(String token) {
        ShareableLinkEntity link = linkRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link not found or invalid."));

        if (!link.isValid()) {
            if (link.isExpired()) {
                throw new IllegalArgumentException("This link has expired.");
            }
            if (link.hasReachedDownloadLimit()) {
                throw new IllegalArgumentException("Download limit reached for this link.");
            }
            throw new IllegalArgumentException("This link is no longer active.");
        }

        link.setDownloadCount(link.getDownloadCount() + 1);
        linkRepository.save(link);

        return s3Service.downloadFile(link.getFile().getS3Key());
    }

    public List<ShareableLinkResponse> getUserLinks(String userId) {
        return linkRepository.findByCreatedByIdAndIsActiveTrue(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void revokeLink(String token, String userId) {
        ShareableLinkEntity link = linkRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Link not found."));

        if (!link.getCreatedBy().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only revoke your own links.");
        }

        link.setIsActive(false);
        linkRepository.save(link);
        log.info("Link revoked: token={}", token);
    }

    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void cleanupExpiredLinks() {
        List<ShareableLinkEntity> expired =
                linkRepository.findByIsActiveTrueAndExpiresAtBefore(LocalDateTime.now());
        expired.forEach(l -> l.setIsActive(false));
        linkRepository.saveAll(expired);
        if (!expired.isEmpty()) {
            log.info("Cleaned up {} expired shareable link(s)", expired.size());
        }
    }

    private ShareableLinkResponse toResponse(ShareableLinkEntity link) {
        return ShareableLinkResponse.builder()
                .token(link.getToken())
                .fileName(link.getFile().getFileName())
                .fileId(link.getFile().getId())
                .createdAt(link.getCreatedAt())
                .expiresAt(link.getExpiresAt())
                .maxDownloads(link.getMaxDownloads())
                .downloadCount(link.getDownloadCount())
                .isActive(link.isValid())
                .build();
    }
}
