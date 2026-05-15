package com.MyProject.MyCloudSpace.io;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RagIngestionResponse {

    private boolean success;
    private String message;
    private String fileName;
    private Long fileId;
    private Integer chunkCount;

    public static RagIngestionResponse success(String fileName, Long fileId, int chunkCount) {
        return RagIngestionResponse.builder()
                .success(true)
                .message("File '" + fileName + "' successfully ingested and ready for Q&A.")
                .fileName(fileName)
                .fileId(fileId)
                .chunkCount(chunkCount)
                .build();
    }

    public static RagIngestionResponse failure(String errorMessage) {
        return RagIngestionResponse.builder()
                .success(false)
                .message(errorMessage)
                .build();
    }
}
