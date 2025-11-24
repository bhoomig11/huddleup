package edu.northeastern.dharrguptab.huddleup.user.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;

/** Represents an application-specific error code related to users. */
public enum UserErrorCode implements IAppErrorCode {
  INVALID_USERNAME,
  INVALID_PASSWORD,
  INVALID_EMAIL,
  USER_NOT_FOUND,
  USERNAME_TAKEN,
  EMAIL_TAKEN;

  @Override
  public String toCodeString() {
    return name();
  }
}
