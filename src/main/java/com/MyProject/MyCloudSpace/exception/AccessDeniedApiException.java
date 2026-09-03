package com.MyProject.MyCloudSpace.exception;

import org.springframework.http.HttpStatus;

public class AccessDeniedApiException extends ApiException {

    public AccessDeniedApiException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
