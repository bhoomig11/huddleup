package edu.northeastern.dharrguptab.huddleup.turf.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseException;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;
import java.sql.SQLException;

public class TurfException extends DatabaseException {
  private final IAppErrorCode turfErrorCode;
  ;

  public TurfException(SQLException sqlException, IAppErrorCode turfErrorCode) {
    super(sqlException);
    this.turfErrorCode = turfErrorCode;
  }

  @Override
  public IAppErrorCode getAppErrorCode() {
    return turfErrorCode;
  }
}
