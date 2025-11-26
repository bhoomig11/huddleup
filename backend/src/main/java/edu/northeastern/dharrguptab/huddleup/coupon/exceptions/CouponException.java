package edu.northeastern.dharrguptab.huddleup.coupon.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseException;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;
import java.sql.SQLException;

public class CouponException extends DatabaseException {
  private final IAppErrorCode couponErrorCode;

  public CouponException(SQLException sqlException, IAppErrorCode couponErrorCode) {
    super(sqlException);
    this.couponErrorCode = couponErrorCode;
  }

  @Override
  public IAppErrorCode getAppErrorCode() {
    return couponErrorCode;
  }
}

