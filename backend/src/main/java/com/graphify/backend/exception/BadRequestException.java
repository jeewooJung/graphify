// backend/src/main/java/com/graphify/backend/exception/BadRequestException.java
package com.graphify.backend.exception;

public class BadRequestException extends RuntimeException {
    private String field;
    private String message;

    public BadRequestException(String message) {
        super(message);
        this.message = message;
    }

    public BadRequestException(String field, String message) {
        super(String.format("Invalid %s: %s", field, message));
        this.field = field;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public String getMessage() {
        return message;
    }
}
