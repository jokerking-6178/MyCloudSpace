package com.MyProject.MyCloudSpace.io;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ShareableLinkResponse {

    private String token;
    private String fileName;
    private Long fileId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Integer maxDownloads;
    private Integer downloadCount;

    private Boolean revoked;
    private Boolean expired;
    private Boolean downloadLimitReached;
    private Boolean usable;

    public String getPublicPath() {
        return "/api/share/download/" + token;
    }
}
