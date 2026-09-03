package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.FileEntity;
import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.exception.ConflictException;
import com.MyProject.MyCloudSpace.exception.ResourceNotFoundException;
import com.MyProject.MyCloudSpace.io.UserRequest;
import com.MyProject.MyCloudSpace.io.UserResponse;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.StorageTierService;
import com.MyProject.MyCloudSpace.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageTierService storageTierService;
    private final S3Service s3Service;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("An account with that email already exists.");
        }

        UserEntity newUser = UserEntity.builder()
                .email(email)
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.NORMAL)
                .authProvider(com.MyProject.MyCloudSpace.Entity.AuthProvider.LOCAL)
                .build();

        userRepository.save(newUser);
        log.info("User created: id={}", newUser.getId());
        return toResponse(newUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findById(String userId) {
        return toResponse(getUserOrThrow(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> ResourceNotFoundException.of("User", email));
        return toResponse(user);
    }

    @Override
    public UserResponse toResponse(UserEntity user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .storageUsed(user.getStorageUsed())
                .maxStorage(storageTierService.getEffectiveMaxStorage(user))
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(String userId) {
        UserEntity user = getUserOrThrow(userId);

        for (FileEntity file : user.getFiles()) {
            try {
                s3Service.deleteFile(file.getS3Key());
            } catch (RuntimeException e) {
                log.error("Could not delete S3 object {} while deleting user {}", file.getS3Key(), userId, e);
            }
        }

        userRepository.delete(user);
        log.info("User deleted: id={}", userId);
    }

    @Override
    @Transactional
    public UserResponse upgradeUser(String userId, Role role) {
        UserEntity user = getUserOrThrow(userId);
        user.setRole(role);
        user = userRepository.save(user);
        log.info("User {} role changed to {}", userId, role);
        return toResponse(user);
    }

    @Override
    @Transactional
    public String disableUser(String userId) {
        UserEntity user = getUserOrThrow(userId);
        user.setRole(Role.DISABLED);
        userRepository.save(user);
        log.info("User {} disabled", userId);
        return "User successfully disabled";
    }

    private UserEntity getUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }
}
