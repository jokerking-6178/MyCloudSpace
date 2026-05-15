package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.io.RagChatRequest;
import com.MyProject.MyCloudSpace.io.RagChatResponse;
import com.MyProject.MyCloudSpace.io.RagIngestionResponse;

public interface RagService {
    public RagIngestionResponse ingestFile(Long fileId, String userId);
    public RagChatResponse chat(RagChatRequest request);
    public void clearConversation(String userId);
}
