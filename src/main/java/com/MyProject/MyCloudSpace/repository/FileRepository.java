package com.MyProject.MyCloudSpace.repository;

import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    List<FileEntity> findByUploadedBy(UserEntity user);

    Optional<FileEntity> findByS3Key(String s3Key);

    List<FileEntity> findByUploadedByAndFileNameContainingIgnoreCase(UserEntity user, String fileName);

    List<FileEntity> findByUploadedByAndContentType(UserEntity user, String contentType);

    List<FileEntity> findByIsPublicTrue();
}
