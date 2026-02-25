package com.MyProject.MyCloudSpace.io;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class FileMetadataDTO {

    private Long id;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String fileSizeFormatted;
    private String uploadedBy;
    private String uploadedByEmail;
    private LocalDateTime uploadedAt;
    private LocalDateTime lastModified;
    private String description;
    private String tags;
    private Boolean isPublic;
    private String downloadUrl;
}
