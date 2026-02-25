package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.io.FileMetadataDTO;
import com.MyProject.MyCloudSpace.io.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileService {
    public FileUploadResponse uploadFile(MultipartFile file, String userId,
                                         String description, String tags) throws IOException;

    public List<FileMetadataDTO> getUserFiles(String userId);

    public FileMetadataDTO getFileMetadata(Long fileId);

    public byte[] downloadFile(Long fileId, String userId);

    public void deleteFile(Long fileId, String userId);

    public void shareFile(Long fileId, String OwnerId, String shareWithId);

    public List<FileMetadataDTO> getSharedFiles(String userId);
}
