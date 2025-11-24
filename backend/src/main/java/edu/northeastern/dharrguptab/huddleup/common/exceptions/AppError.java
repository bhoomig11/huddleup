package edu.northeastern.dharrguptab.huddleup.common.exceptions;

import java.io.Serializable;

/**
 * Represents a serializable error in the application.
 *
 * @param status the HTTP status code for the error
 * @param error the HTTP status message for the error
 * @param code the application-specific error code
 * @param message the application-specific error message
 */
public record AppError(int status, String error, String code, String message)
    implements Serializable {}
