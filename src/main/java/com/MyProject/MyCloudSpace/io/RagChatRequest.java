package com.MyProject.MyCloudSpace.io;

import lombok.Data;

@Data
public class RagChatRequest {

    private String userId;
    private String question;
    private Long fileId;
    private Integer topK;
}
