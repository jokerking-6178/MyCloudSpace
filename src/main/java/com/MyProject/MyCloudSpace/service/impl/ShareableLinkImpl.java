package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.Entity.ShareableLinkEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.exception.AccessDeniedApiException;
import com.MyProject.MyCloudSpace.exception.LinkUnavailableException;
import com.MyProject.MyCloudSpace.exception.ResourceNotFoundException;
import com.MyProject.MyCloudSpace.io.ShareableLinkRequest;
import com.MyProject.MyCloudSpace.io.ShareableLinkResponse;
import com.MyProject.MyCloudSpace.repository.FileRepository;
import com.MyProject.MyCloudSpace.repository.ShareableLinkRepository;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.ShareableLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShareableLinkImpl implements ShareableLinkService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final ShareableLinkRepository linkRepository;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;

    @Override
    @Transactional
    public ShareableLinkResponse createLink(Long fileId, String userId, ShareableLinkRequest request) {
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> ResourceNotFoundException.of("File", fileId));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (!file.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedApiException(
                    "Only the owner of a file can create a shareable link for it.");
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(request.getExpirySeconds());

        ShareableLinkEntity link = ShareableLinkEntity.builder()
                .token(generateToken())
                .file(file)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .maxDownloads(request.getMaxDownloads())
                .downloadCount(0)
                .isActive(true)
                .build();

        ShareableLinkEntity saved = linkRepository.save(link);
        log.info("Shareable link created: fileId={} expiresAt={}", fileId, expiresAt);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public SharedDownload downloadViaToken(String token) {
        ShareableLinkEntity link = linkRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("That link is not valid."));

        if (!Boolean.TRUE.equals(link.getIsActive())) {
            throw new LinkUnavailableException("This link has been revoked.");
        }
        if (link.isExpired()) {
            throw new LinkUnavailableException("This link has expired.");
        }
        if (link.hasReachedDownloadLimit()) {
            throw new LinkUnavailableException("This link has reached its download limit.");
        }

        int updated = linkRepository.incrementDownloadCount(link.getId());
        if (updated == 0) {
            throw new LinkUnavailableException("This link has reached its download limit.");
        }

        FileEntity file = link.getFile();
        return new SharedDownload(
                s3Service.downloadFile(file.getS3Key()),
                file.getFileName(),
                file.getContentType());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShareableLinkResponse> getUserLinks(String userId) {
        return linkRepository.findByCreatedByIdAndIsActiveTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void revokeLink(String token, String userId) {
        ShareableLinkEntity link = linkRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("That link does not exist."));

        if (!link.getCreatedBy().getId().equals(userId)) {
            throw new AccessDeniedApiException("You can only revoke your own links.");
        }

        link.setIsActive(false);
        linkRepository.save(link);
        log.info("Link revoked for fileId={}", link.getFile().getId());
    }

    @Override
    @Scheduled(fixedRateString = "${app.share.cleanup-interval-ms:3600000}")
    @Transactional
    public void cleanupExpiredLinks() {
        List<ShareableLinkEntity> expired =
                linkRepository.findByIsActiveTrueAndExpiresAtBefore(LocalDateTime.now());

        if (expired.isEmpty()) {
            return;
        }

        expired.forEach(link -> link.setIsActive(false));
        linkRepository.saveAll(expired);
        log.info("Cleaned up {} expired shareable link(s)", expired.size());
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private ShareableLinkResponse toResponse(ShareableLinkEntity link) {
        boolean revoked = !Boolean.TRUE.equals(link.getIsActive());
        boolean expired = link.isExpired();
        boolean limitReached = link.hasReachedDownloadLimit();

        return ShareableLinkResponse.builder()
                .token(link.getToken())
                .fileName(link.getFile().getFileName())
                .fileId(link.getFile().getId())
                .createdAt(link.getCreatedAt())
                .expiresAt(link.getExpiresAt())
                .maxDownloads(link.getMaxDownloads())
                .downloadCount(link.getDownloadCount())
                .revoked(revoked)
                .expired(expired)
                .downloadLimitReached(limitReached)
                .usable(!revoked && !expired && !limitReached)
                .build();
    }
}
