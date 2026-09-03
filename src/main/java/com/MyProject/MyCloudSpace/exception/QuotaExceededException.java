package com.MyProject.MyCloudSpace.exception;

import org.springframework.http.HttpStatus;

public class QuotaExceededException extends ApiException {

    public QuotaExceededException(String message) {
        super(HttpStatus.PAYLOAD_TOO_LARGE, message);
    }
}
