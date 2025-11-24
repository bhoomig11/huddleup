package edu.northeastern.dharrguptab.huddleup.common.exceptions;

/** Represents an application-specific error code to be used in API responses and logging. */
public interface IAppErrorCode {

  /**
   * Convert the error code to a string.
   *
   * @return the string representation of the error code
   */
  String toCodeString();
}
