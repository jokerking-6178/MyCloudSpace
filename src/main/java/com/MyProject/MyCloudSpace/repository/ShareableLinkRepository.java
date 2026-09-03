package com.MyProject.MyCloudSpace.repository;

import com.MyProject.MyCloudSpace.Entity.ShareableLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShareableLinkRepository extends JpaRepository<ShareableLinkEntity, String> {

    Optional<ShareableLinkEntity> findByToken(String token);

    List<ShareableLinkEntity> findByCreatedByIdAndIsActiveTrueOrderByCreatedAtDesc(String userId);

    List<ShareableLinkEntity> findByIsActiveTrueAndExpiresAtBefore(LocalDateTime now);

    @Modifying
    void deleteByFileId(Long fileId);

    @Modifying
    @Query("""
            UPDATE ShareableLinkEntity l
               SET l.downloadCount = l.downloadCount + 1
             WHERE l.id = :id
               AND l.isActive = true
               AND (l.maxDownloads IS NULL OR l.downloadCount < l.maxDownloads)
            """)
    int incrementDownloadCount(@Param("id") String id);
}
