package com.MyProject.MyCloudSpace.util;

import com.MyProject.MyCloudSpace.Entity.AuthProvider;
import com.MyProject.MyCloudSpace.Entity.Role;
import com.MyProject.MyCloudSpace.Entity.UserEntity;
import com.MyProject.MyCloudSpace.repository.UserRepository;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;

@Slf4j
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
        AuthProvider provider = resolveProvider(authentication);

        String email = extractEmail(oAuth2User, provider);
        if (email == null || email.isBlank()) {
            log.warn("OAuth login from {} did not supply an email address", provider);
            getRedirectStrategy().sendRedirect(request, response,
                    UriComponentsBuilder.fromUriString(redirectUri)
                            .queryParam("error", "no_email")
                            .build().toUriString());
            return;
        }

        email = email.trim().toLowerCase();
        String name = extractName(oAuth2User, provider);

        UserEntity user;
        try {
            user = processOAuth2User(email, name, provider);
        } catch (IllegalStateException e) {
            getRedirectStrategy().sendRedirect(request, response,
                    UriComponentsBuilder.fromUriString(redirectUri)
                            .queryParam("error", "provider_mismatch")
                            .build().toUriString());
            return;
        }

        String jwtToken = jwtUtil.generateToken(new AppUserPrincipal(user));

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", jwtToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    private AuthProvider resolveProvider(Authentication authentication) {
        if (authentication instanceof OAuth2AuthenticationToken token) {
            return "google".equalsIgnoreCase(token.getAuthorizedClientRegistrationId())
                    ? AuthProvider.GOOGLE
                    : AuthProvider.GITHUB;
        }
        return AuthProvider.GITHUB;
    }

    private String extractEmail(OAuth2User oAuth2User, AuthProvider provider) {
        return oAuth2User.getAttribute("email");
    }

    private String extractName(OAuth2User oAuth2User, AuthProvider provider) {
        String name = oAuth2User.getAttribute("name");
        if (name == null || name.isBlank()) {
            name = oAuth2User.getAttribute("login");
        }
        return name;
    }

    private UserEntity processOAuth2User(String email, String name, AuthProvider provider) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    AuthProvider existing = existingUser.getAuthProvider();
                    if (existing == null) {
                        existingUser.setAuthProvider(provider);
                        return userRepository.save(existingUser);
                    }
                    if (existing != provider) {
                        log.warn("Refusing to link {} login to an account registered via {}", provider, existing);
                        throw new IllegalStateException("Provider mismatch");
                    }
                    return existingUser;
                })
                .orElseGet(() -> createNewOAuth2User(email, name, provider));
    }

    private UserEntity createNewOAuth2User(String email, String name, AuthProvider provider) {
        UserEntity newUser = UserEntity.builder()
                .email(email)
                .username(uniqueUsername(name, email))
                .password(null)
                .role(Role.NORMAL)
                .authProvider(provider)
                .storageUsed(0L)
                .baseStorage(10L)
                .build();

        return userRepository.save(newUser);
    }

    private String uniqueUsername(String name, String email) {
        String base = (name != null && !name.isBlank()) ? name.trim() : email.split("@")[0];
        return base + "-" + java.util.UUID.randomUUID().toString().substring(0, 6);
    }
}
