package com.MyProject.MyCloudSpace.service;

import com.MyProject.MyCloudSpace.io.RagChatRequest;
import com.MyProject.MyCloudSpace.io.RagChatResponse;
import com.MyProject.MyCloudSpace.io.RagIngestionResponse;
import java.util.List;

public interface RagService {

    RagIngestionResponse ingestFile(Long fileId, String userId);

    RagChatResponse chat(RagChatRequest request, String userId);

    void clearConversation(String userId);

    List<Long> getIngestedFileIds(String userId);

    void deleteFileVectors(Long fileId);
}
