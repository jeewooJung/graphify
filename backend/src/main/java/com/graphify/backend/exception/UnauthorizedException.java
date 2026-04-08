// backend/src/main/java/com/graphify/backend/exception/UnauthorizedException.java
package com.graphify.backend.exception;

public class UnauthorizedException extends RuntimeException {
    private String action;
    private String resource;

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String action, String resource) {
        super(String.format("User is not authorized to %s %s", action, resource));
        this.action = action;
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public String getResource() {
        return resource;
    }
}
