package com.MyProject.MyCloudSpace.util;

import com.MyProject.MyCloudSpace.Entity.AuthProvider;
import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class Oauth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String registrationId = getRegistrationId(request);
        AuthProvider provider = registrationId.equalsIgnoreCase("google") ?
                AuthProvider.GOOGLE : AuthProvider.GITHUB;

        String email = extractEmail(oAuth2User, provider);
        String name = extractName(oAuth2User, provider);

        UserEntity user = processOAuth2User(email, name, provider);

        User userDetails = new User(user.getEmail(), "", Collections.emptyList());
        String jwtToken = jwtUtil.generateToken(userDetails);

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", jwtToken)
                .queryParam("email", email)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private String getRegistrationId(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        if (requestUri.contains("google")) {
            return "google";
        } else if (requestUri.contains("github")) {
            return "github";
        }
        return "unknown";
    }

    private String extractEmail(OAuth2User oAuth2User, AuthProvider provider) {
        if (provider == AuthProvider.GOOGLE) {
            return oAuth2User.getAttribute("email");
        } else if (provider == AuthProvider.GITHUB) {
            String email = oAuth2User.getAttribute("email");
            if (email == null || email.isEmpty()) {
                String login = oAuth2User.getAttribute("login");
                email = login + "@github.com";
            }
            return email;
        }
        return null;
    }

    private String extractName(OAuth2User oAuth2User, AuthProvider provider) {
        if (provider == AuthProvider.GOOGLE) {
            return oAuth2User.getAttribute("name");
        } else if (provider == AuthProvider.GITHUB) {
            String name = oAuth2User.getAttribute("name");
            if (name == null || name.isEmpty()) {
                name = oAuth2User.getAttribute("login");
            }
            return name;
        }
        return null;
    }

    private UserEntity processOAuth2User(String email, String name, AuthProvider provider) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getAuthProvider() == null) {
                        existingUser.setAuthProvider(provider);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> createNewOAuth2User(email, name, provider));
    }

    private UserEntity createNewOAuth2User(String email, String name, AuthProvider provider) {
        UserEntity newUser = UserEntity.builder()
                .email(email)
                .username(name != null ? name : email.split("@")[0])
                .password("")
                .role(Role.NORMAL)
                .authProvider(provider)
                .storageUsed(0L)
                .baseStorage(10L)
                .build();

        return userRepository.save(newUser);
    }
}
