package com.MyProject.MyCloudSpace.controller;

import com.MyProject.MyCloudSpace.io.FileMetadataDTO;
import com.MyProject.MyCloudSpace.io.FileUploadResponse;
import com.MyProject.MyCloudSpace.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileServiceImpl;

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(@RequestPart("file") MultipartFile file,
                                                         @RequestPart("uploadedBy") String userId ,
                                                         @RequestPart(value = "description", required = false) String description,
                                                         @RequestPart(value = "tags", required = false) String tags) {
        try {
            FileUploadResponse response = fileServiceImpl.uploadFile(file, userId, description, tags);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new FileUploadResponse(null, null, null, null, e.getMessage(), 0L, null));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FileMetadataDTO>> getUserFiles(@PathVariable String userId) {
        try{
            List<FileMetadataDTO> files = fileServiceImpl.getUserFiles(userId);
            return ResponseEntity.ok(files);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/shared/{userId}")
    public ResponseEntity<List<FileMetadataDTO>> getSharedFiles(@PathVariable String userId) {
        try {
            List<FileMetadataDTO> files = fileServiceImpl.getSharedFiles(userId);
            return ResponseEntity.ok(files);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<FileMetadataDTO> getFileMetadata(@PathVariable Long fileId) {
        try {
            FileMetadataDTO metadata = fileServiceImpl.getFileMetadata(fileId);
            return ResponseEntity.ok(metadata);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable Long fileId, @RequestParam String userId) {
        try {
            FileMetadataDTO metadata = fileServiceImpl.getFileMetadata(fileId);
            byte[] data = fileServiceImpl.downloadFile(fileId, userId);
            ByteArrayResource resource = new ByteArrayResource(data);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + metadata.getFileName() + "\"")
                    .contentLength(data.length)
                    .contentType(MediaType.parseMediaType(metadata.getContentType()))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/remove/{fileId}/{userId}")
    public ResponseEntity<String> deleteFile(@PathVariable Long fileId, @PathVariable String userId) {
        try {
            fileServiceImpl.deleteFile(fileId, userId);
            return ResponseEntity.ok("File deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/share/{fileId}/{ownerId}/{shareWithUserEmail}")
    public ResponseEntity<String> shareFile(
            @PathVariable Long fileId,
            @PathVariable String ownerId,
            @PathVariable String shareWithUserEmail) {
        try {
            fileServiceImpl.shareFile(fileId, ownerId, shareWithUserEmail);
            return ResponseEntity.ok("File shared successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
