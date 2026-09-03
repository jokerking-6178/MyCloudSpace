package com.MyProject.MyCloudSpace.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String email;
    private String token;
    private UserResponse user;
}
