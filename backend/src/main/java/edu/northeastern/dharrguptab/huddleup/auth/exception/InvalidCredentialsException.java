package edu.northeastern.dharrguptab.huddleup.auth.exception;

/**
 * Represents an exception when a given set of login credentials are invalid.
 */
public class InvalidCredentialsException extends RuntimeException {
  private static final String MESSAGE = "Invalid Credentials";

  /**
   * Create an exception when login credentials are invalid.
   */
  public InvalidCredentialsException() {
    super(MESSAGE);
  }
}
