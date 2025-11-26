package edu.northeastern.dharrguptab.huddleup.auth.exception;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;

/** Represents authentication-specific error codes. */
public enum AuthErrorCode implements IAppErrorCode {
  INVALID_CREDENTIALS,
  UNAUTHENTICATED,
  UNAUTHORIZED;

  @Override
  public String toCodeString() {
    return name();
  }
}

