package com.MyProject.MyCloudSpace.io;

import com.MyProject.MyCloudSpace.Entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private String id;
    private String email;
    private String username;
    private Role role;
    private Long storageUsed;
    private Long maxStorage;

}
