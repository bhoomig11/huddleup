package edu.northeastern.dharrguptab.huddleup.user.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseException;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;
import java.sql.SQLException;

/** Represents an exception thrown during a user-related operation. */
public class UserException extends DatabaseException {
  private final IAppErrorCode userErrorCode;

  /**
   * Create a new user-related exception.
   *
   * @param sqlException the SQL exception that was thrown
   * @param userErrorCode the user error code that represents this exception
   */
  public UserException(SQLException sqlException, IAppErrorCode userErrorCode) {
    super(sqlException);
    this.userErrorCode = userErrorCode;
  }

  @Override
  public IAppErrorCode getAppErrorCode() {
    return userErrorCode;
  }
}
