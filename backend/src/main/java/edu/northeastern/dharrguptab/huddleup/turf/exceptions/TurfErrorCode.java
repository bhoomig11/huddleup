package edu.northeastern.dharrguptab.huddleup.turf.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;

/** Represents an application-specific error code related to turfs. */
public enum TurfErrorCode implements IAppErrorCode {
  INVALID_TURF_ID,
  INVALID_BOOKING_DATA,
  INVALID_REVIEW_DATA,
  RESOURCE_NOT_FOUND,
  BOOKING_CONFLICT,
  REVIEW_CONFLICT;

  @Override
  public String toCodeString() {
    return name();
  }
}
