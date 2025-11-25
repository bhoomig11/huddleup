package edu.northeastern.dharrguptab.huddleup.auth.exception;

/**
 * Represents an exception when a request is not authorized.
 */
public class UnauthorizedException extends RuntimeException {
  private static final String MESSAGE = "Unauthorized access";

  /**
   * Create an exception for an unauthorized request.
   */
  public UnauthorizedException() {
    super(MESSAGE);
  }
}
