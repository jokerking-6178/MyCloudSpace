package com.MyProject.MyCloudSpace.io;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShareableLinkResponse {
    private String        token;
    private String        fileName;
    private Long          fileId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Integer       maxDownloads;
    private Integer       downloadCount;
    private Boolean       isActive;
    public String getPublicUrl() {
        return "/api/share/download/" + token;
    }
}