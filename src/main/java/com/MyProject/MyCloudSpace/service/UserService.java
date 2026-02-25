package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.io.UserRequest;
import com.MyProject.MyCloudSpace.io.UserResponse;


public interface UserService {

    UserResponse createUser(UserRequest request);
    UserResponse findById(String userId);
    UserResponse findByEmail(String email);
    void deleteUser(String Userid);
    UserResponse upgradeUser(String userId, Role role);
    String disableUser(String userId);
}
