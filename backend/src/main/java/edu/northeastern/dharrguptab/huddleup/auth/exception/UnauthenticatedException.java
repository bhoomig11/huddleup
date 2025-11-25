package edu.northeastern.dharrguptab.huddleup.auth.exception;

/**
 * Represents an exception when a request is not authenticated.
 */
public class UnauthenticatedException extends RuntimeException {
  private static final String MESSAGE = "Authentication required";

  /**
   * Create an exception for an unauthenticated request.
   */
  public UnauthenticatedException() {
    super(MESSAGE);
  }
}
