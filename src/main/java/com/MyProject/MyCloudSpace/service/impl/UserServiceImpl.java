package com.MyProject.MyCloudSpace.service.impl;

import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.io.UserRequest;
import com.MyProject.MyCloudSpace.io.UserResponse;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserRequest request) {
        UserEntity newUser = convertToEntity(request);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(newUser);
        log.info("user successfully created {}", newUser);
        return convertToResponse(newUser);
    }

    private UserResponse convertToResponse(UserEntity newUser) {
        return UserResponse.builder()
                .id(newUser.getId())
                .email(newUser.getEmail())
                .username(newUser.getUsername())
                .role(newUser.getRole())
                .storageUsed(newUser.getStorageUsed())
                .maxStorage(newUser.getBaseStorage())
                .build();
    }

    private UserEntity convertToEntity(UserRequest request) {
        return UserEntity.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .role(Role.NORMAL)
                .build();
    }

    @Override
    public UserResponse findById(String userId) {
        try{
            UserEntity existingUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not Found"));
            log.info("user found with id: {} {}",userId, existingUser);
            return convertToResponse(existingUser);
        }catch (Exception e){
            log.error("cannot find user with id {} and error is {}" ,userId, e.getMessage());
        }
        return null;
    }

    @Override
    public UserResponse findByEmail(String email) {
        try{
            UserEntity existingUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not Found"));
            log.info("user found with id: {} {}",email, existingUser);
            return convertToResponse(existingUser);
        }catch (Exception e){
            log.error("cannot find user with id {} and error is {}" ,email, e.getMessage());
        }
        return null;
    }

    @Override
    public void deleteUser(String userId) {
        try{
            UserEntity existingUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not Found"));
            userRepository.delete(existingUser);
            log.info("user successfully with id: {}",userId);
        }catch (Exception e){
            log.error("unable to delete user with id {} and error is {}" ,userId, e.getMessage());
        }
    }

    @Override
    public UserResponse upgradeUser(String userId, Role role) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        user.setRole(role);
        user = userRepository.save(user);
        log.info("user with id {} role changes to {}", userId, role);
        return convertToResponse(user);
    }

    @Override
    public String disableUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not Found"));
        user.setRole(Role.DISABLED);
        user = userRepository.save(user);
        log.info("user with id {} role changes to disable", userId);
        return "user successfully disabled";

    }
}
