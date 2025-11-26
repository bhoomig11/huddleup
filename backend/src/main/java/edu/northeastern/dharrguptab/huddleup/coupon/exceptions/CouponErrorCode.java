package edu.northeastern.dharrguptab.huddleup.coupon.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;

/** Represents an application-specific error code related to coupons. */
public enum CouponErrorCode implements IAppErrorCode {
  INVALID_COUPON_ID;

  @Override
  public String toCodeString() {
    return name();
  }
}

