package edu.northeastern.dharrguptab.huddleup.common.exceptions;

/** Represents an application-specific error code. */
public enum AppErrorCode implements IAppErrorCode {
  UNKNOWN;

  @Override
  public String toCodeString() {
    return name();
  }
}
