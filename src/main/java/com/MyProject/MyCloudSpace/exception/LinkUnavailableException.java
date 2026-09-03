package com.MyProject.MyCloudSpace.exception;

import org.springframework.http.HttpStatus;

public class LinkUnavailableException extends ApiException {

    public LinkUnavailableException(String message) {
        super(HttpStatus.GONE, message);
    }
}
