package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.io.ShareableLinkRequest;
import com.MyProject.MyCloudSpace.io.ShareableLinkResponse;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import com.MyProject.MyCloudSpace.service.ShareableLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ShareableLinkController {

    private final ShareableLinkService shareableLinkService;

    @PostMapping("/links/{fileId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ShareableLinkResponse createShareableLink(@AuthenticationPrincipal AppUserPrincipal principal,
                                                     @PathVariable Long fileId,
                                                     @Valid @RequestBody ShareableLinkRequest request) {
        return shareableLinkService.createLink(fileId, principal.getId(), request);
    }

    @GetMapping("/links")
    public List<ShareableLinkResponse> getMyLinks(@AuthenticationPrincipal AppUserPrincipal principal) {
        return shareableLinkService.getUserLinks(principal.getId());
    }

    @DeleteMapping("/links/{token}")
    public Map<String, String> revokeLink(@AuthenticationPrincipal AppUserPrincipal principal,
                                          @PathVariable String token) {
        shareableLinkService.revokeLink(token, principal.getId());
        return Map.of("message", "Link revoked successfully");
    }

    @GetMapping("/download/{token}")
    public ResponseEntity<ByteArrayResource> downloadViaLink(@PathVariable String token) {
        ShareableLinkService.SharedDownload file = shareableLinkService.downloadViaToken(token);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentLength(file.data().length)
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(new ByteArrayResource(file.data()));
    }
}
