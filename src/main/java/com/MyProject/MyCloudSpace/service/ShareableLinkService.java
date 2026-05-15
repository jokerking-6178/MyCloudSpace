package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.io.ShareableLinkRequest;
import com.MyProject.MyCloudSpace.io.ShareableLinkResponse;

import java.util.List;

public interface ShareableLinkService {

    public ShareableLinkResponse createLink(Long fileId, String userId, ShareableLinkRequest request);
    public byte[] downloadViaToken(String token);
    public void revokeLink(String token, String userId);
    public void cleanupExpiredLinks();
    public List<ShareableLinkResponse> getUserLinks(String userId);
}
