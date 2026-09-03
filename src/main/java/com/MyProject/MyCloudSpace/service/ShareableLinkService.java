package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.io.ShareableLinkRequest;
import com.MyProject.MyCloudSpace.io.ShareableLinkResponse;
import java.util.List;

public interface ShareableLinkService {

    ShareableLinkResponse createLink(Long fileId, String userId, ShareableLinkRequest request);

    SharedDownload downloadViaToken(String token);

    void revokeLink(String token, String userId);

    void cleanupExpiredLinks();

    List<ShareableLinkResponse> getUserLinks(String userId);

    record SharedDownload(byte[] data, String fileName, String contentType) {
    }
}
