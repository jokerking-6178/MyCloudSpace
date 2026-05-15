package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.io.ShareableLinkRequest;
import com.MyProject.MyCloudSpace.io.ShareableLinkResponse;
import com.MyProject.MyCloudSpace.service.ShareableLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ShareableLinkController {

    private final ShareableLinkService shareableLinkService;

    @PostMapping("/api/files/{fileId}/share-link")
    public ResponseEntity<ShareableLinkResponse> createShareableLink(
            @PathVariable Long fileId,
            @RequestParam String userId,
            @RequestBody ShareableLinkRequest request) {
        try {
            ShareableLinkResponse response =
                    shareableLinkService.createLink(fileId, userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @GetMapping("/api/share/download/{token}")
    public ResponseEntity<ByteArrayResource> downloadViaLink(
            @PathVariable String token) {
        try {
            byte[] data = shareableLinkService.downloadViaToken(token);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"shared-file\"")
                    .contentLength(data.length)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new ByteArrayResource(data));
        } catch (IllegalArgumentException e) {
            // Return 410 Gone for expired / revoked links
            return ResponseEntity.status(HttpStatus.GONE).build();
        }
    }

    @GetMapping("/api/share/links")
    public ResponseEntity<List<ShareableLinkResponse>> getUserLinks(
            @RequestParam String userId) {
        return ResponseEntity.ok(shareableLinkService.getUserLinks(userId));
    }

    @DeleteMapping("/api/share/links/{token}")
    public ResponseEntity<String> revokeLink(
            @PathVariable String token,
            @RequestParam String userId) {
        try {
            shareableLinkService.revokeLink(token, userId);
            return ResponseEntity.ok("Link revoked successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}