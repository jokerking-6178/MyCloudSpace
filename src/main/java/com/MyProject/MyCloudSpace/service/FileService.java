package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.io.FileMetadataDTO;
import com.MyProject.MyCloudSpace.io.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface FileService {

    FileUploadResponse uploadFile(MultipartFile file, String userId, String description, String tags)
            throws IOException;

    List<FileMetadataDTO> getUserFiles(String userId);

    List<FileMetadataDTO> searchUserFiles(String userId, String query);

    FileMetadataDTO getFileMetadata(Long fileId, String userId);

    DownloadedFile downloadFile(Long fileId, String userId);

    void deleteFile(Long fileId, String userId);

    void shareFile(Long fileId, String ownerId, String shareWithEmail);

    void unshareFile(Long fileId, String ownerId, String unshareWithEmail);

    List<FileMetadataDTO> getSharedFiles(String userId);

    List<String> getSharedWithEmails(Long fileId, String ownerId);

    record DownloadedFile(byte[] data, String fileName, String contentType) {
    }
}
