package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.io.UserRequest;
import com.MyProject.MyCloudSpace.io.UserResponse;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import com.MyProject.MyCloudSpace.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerUser(@Valid @RequestBody UserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal AppUserPrincipal principal) {
        return userService.findById(principal.getId());
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOwnAccount(@AuthenticationPrincipal AppUserPrincipal principal) {
        userService.deleteUser(principal.getId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse findUser(@PathVariable String id) {
        return userService.findById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUserRole(@PathVariable String id, @RequestBody Role role) {
        return userService.upgradeUser(id, role);
    }

    @PutMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public String disableUser(@PathVariable String id) {
        return userService.disableUser(id);
    }
}
