package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.io.AuthRequest;
import com.MyProject.MyCloudSpace.io.AuthResponse;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import com.MyProject.MyCloudSpace.service.UserService;
import com.MyProject.MyCloudSpace.service.impl.AppUserDetailService;
import com.MyProject.MyCloudSpace.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserDetailService userDetailsService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        AppUserPrincipal principal = userDetailsService.loadUserByUsername(email);

        return AuthResponse.builder()
                .email(principal.getEmail())
                .token(jwtUtil.generateToken(principal))
                .user(userService.findById(principal.getId()))
                .build();
    }
}
