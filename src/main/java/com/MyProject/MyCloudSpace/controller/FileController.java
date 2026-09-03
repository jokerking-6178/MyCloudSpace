package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.exception.BadRequestException;
import com.MyProject.MyCloudSpace.io.FileMetadataDTO;
import com.MyProject.MyCloudSpace.io.FileUploadResponse;
import com.MyProject.MyCloudSpace.security.AppUserPrincipal;
import com.MyProject.MyCloudSpace.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public FileUploadResponse uploadFile(@AuthenticationPrincipal AppUserPrincipal principal,
                                         @RequestPart("file") MultipartFile file,
                                         @RequestPart(value = "description", required = false) String description,
                                         @RequestPart(value = "tags", required = false) String tags)
            throws IOException {
        return fileService.uploadFile(file, principal.getId(), description, tags);
    }

    @GetMapping
    public List<FileMetadataDTO> getMyFiles(@AuthenticationPrincipal AppUserPrincipal principal,
                                            @RequestParam(value = "q", required = false) String query) {
        return fileService.searchUserFiles(principal.getId(), query);
    }

    @GetMapping("/shared")
    public List<FileMetadataDTO> getSharedWithMe(@AuthenticationPrincipal AppUserPrincipal principal) {
        return fileService.getSharedFiles(principal.getId());
    }

    @GetMapping("/{fileId}")
    public FileMetadataDTO getFileMetadata(@AuthenticationPrincipal AppUserPrincipal principal,
                                           @PathVariable Long fileId) {
        return fileService.getFileMetadata(fileId, principal.getId());
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<ByteArrayResource> downloadFile(@AuthenticationPrincipal AppUserPrincipal principal,
                                                          @PathVariable Long fileId) {
        FileService.DownloadedFile file = fileService.downloadFile(fileId, principal.getId());

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentLength(file.data().length)
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(new ByteArrayResource(file.data()));
    }

    @DeleteMapping("/{fileId}")
    public Map<String, String> deleteFile(@AuthenticationPrincipal AppUserPrincipal principal,
                                          @PathVariable Long fileId) {
        fileService.deleteFile(fileId, principal.getId());
        return Map.of("message", "File deleted successfully");
    }

    @GetMapping("/{fileId}/shares")
    public List<String> listShares(@AuthenticationPrincipal AppUserPrincipal principal,
                                   @PathVariable Long fileId) {
        return fileService.getSharedWithEmails(fileId, principal.getId());
    }

    @PostMapping("/{fileId}/shares")
    public Map<String, String> shareFile(@AuthenticationPrincipal AppUserPrincipal principal,
                                         @PathVariable Long fileId,
                                         @RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("An email address is required.");
        }
        fileService.shareFile(fileId, principal.getId(), email);
        return Map.of("message", "File shared successfully");
    }

    @DeleteMapping("/{fileId}/shares")
    public Map<String, String> unshareFile(@AuthenticationPrincipal AppUserPrincipal principal,
                                           @PathVariable Long fileId,
                                           @RequestParam("email") String email) {
        fileService.unshareFile(fileId, principal.getId(), email);
        return Map.of("message", "Sharing removed");
    }
}
