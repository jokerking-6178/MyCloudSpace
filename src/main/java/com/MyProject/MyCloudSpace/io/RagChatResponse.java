package com.MyProject.MyCloudSpace.io;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RagChatResponse {

    private String answer;
    private List<SourceChunk> sources;

    @Data
    @Builder
    public static class SourceChunk {
        private String content;
        private String fileName;
        private String fileId;
    }

    public static RagChatResponse error(String message) {
        return RagChatResponse.builder()
                .answer(message)
                .sources(List.of())
                .build();
    }
}
