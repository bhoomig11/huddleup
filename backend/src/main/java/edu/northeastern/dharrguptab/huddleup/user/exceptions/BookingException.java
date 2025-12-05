package edu.northeastern.dharrguptab.huddleup.user.exceptions;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseException;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.IAppErrorCode;
import java.sql.SQLException;

/** Represents an exception thrown during a booking-related operation. */
public class BookingException extends DatabaseException {
  private final IAppErrorCode bookingErrorCode;

  /**
   * Create a new booking-related exception.
   *
   * @param sqlException the SQL exception that was thrown
   * @param bookingErrorCode the booking error code that represents this exception
   */
  public BookingException(SQLException sqlException, IAppErrorCode bookingErrorCode) {
    super(sqlException);
    this.bookingErrorCode = bookingErrorCode;
  }

  @Override
  public IAppErrorCode getAppErrorCode() {
    return bookingErrorCode;
  }
}

