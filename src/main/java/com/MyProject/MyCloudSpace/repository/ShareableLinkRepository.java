package com.MyProject.MyCloudSpace.repository;

import com.MyProject.MyCloudSpace.Entity.ShareableLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShareableLinkRepository extends JpaRepository<ShareableLinkEntity, String> {

    Optional<ShareableLinkEntity> findByToken(String token);

    List<ShareableLinkEntity> findByCreatedByIdAndIsActiveTrue(String userId);

    List<ShareableLinkEntity> findByIsActiveTrueAndExpiresAtBefore(LocalDateTime now);
}
