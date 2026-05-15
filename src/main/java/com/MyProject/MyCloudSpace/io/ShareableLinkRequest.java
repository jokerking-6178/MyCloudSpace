package com.MyProject.MyCloudSpace.io;

import lombok.Data;

@Data
public class ShareableLinkRequest {

    private long expirySeconds;
    private Integer maxDownloads;
}