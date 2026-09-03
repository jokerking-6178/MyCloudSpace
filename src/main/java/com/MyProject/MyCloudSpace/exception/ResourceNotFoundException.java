package com.MyProject.MyCloudSpace.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }

    public static ResourceNotFoundException of(String what, Object id) {
        return new ResourceNotFoundException(what + " not found: " + id);
    }
}
