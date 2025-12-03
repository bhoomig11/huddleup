package edu.northeastern.dharrguptab.huddleup.user.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;

/** Represents an application-specific error code related to bookings. */
public enum BookingErrorCode implements IAppErrorCode {
  INVALID_INPUT,
  USER_NOT_FOUND,
  TURF_NOT_FOUND,
  BOOKING_NOT_FOUND;

  @Override
  public String toCodeString() {
    return name();
  }
}

