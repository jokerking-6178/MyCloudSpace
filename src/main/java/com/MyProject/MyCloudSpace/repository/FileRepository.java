package com.MyProject.MyCloudSpace.repository;

import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {

    List<FileEntity> findByUploadedByOrderByUploadedAtDesc(UserEntity user);

    List<FileEntity> findByUploadedByAndFileNameContainingIgnoreCaseOrderByUploadedAtDesc(UserEntity user, String fileName);
}
