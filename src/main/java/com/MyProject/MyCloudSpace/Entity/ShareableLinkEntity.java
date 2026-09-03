package com.MyProject.MyCloudSpace.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shareable_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareableLinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileEntity file;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private UserEntity createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "max_downloads")
    private Integer maxDownloads;

    @Builder.Default
    @Column(name = "download_count")
    private Integer downloadCount = 0;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean hasReachedDownloadLimit() {
        return maxDownloads != null && downloadCount != null && downloadCount >= maxDownloads;
    }

    public boolean isValid() {
        return Boolean.TRUE.equals(isActive) && !isExpired() && !hasReachedDownloadLimit();
    }
}