package edu.northeastern.dharrguptab.huddleup.common.exceptions;

/** Represents a database-related exception in the application. */
public interface IDatabaseException {

  /**
   * Get the high-level category of the database exception.
   *
   * @return the database exception category
   */
  DatabaseExceptionCategory getDatabaseExceptionCategory();

  /**
   * Get the application error code representing this exception.
   *
   * @return the app error code
   */
  IAppErrorCode getAppErrorCode();
}
