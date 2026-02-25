package com.MyProject.MyCloudSpace.repository;

import com.MyProject.MyCloudSpace.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {

    Optional<UserEntity> findById(String userId);
    Optional<UserEntity> findByEmail(String email);
}
