package edu.northeastern.dharrguptab.huddleup.common.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Maps each kind of database exception for the application to the corresponding SQLState code and
 * HTTP status.
 */
public enum DatabaseExceptionCategory {
  VALIDATION_ERROR("45001", HttpStatus.BAD_REQUEST),
  RESOURCE_NOT_FOUND("45002", HttpStatus.NOT_FOUND),
  RESOURCE_CONFLICT("45003", HttpStatus.CONFLICT),
  GENERIC_APP_ERROR("45000", HttpStatus.BAD_REQUEST),
  UNKNOWN(null, HttpStatus.INTERNAL_SERVER_ERROR);

  private final String SQLState;
  private final HttpStatus httpStatus;

  /**
   * Create a new database exception category.
   *
   * @param SQLState the SQLState code that represents the category
   * @param httpStatus the corresponding HTTP status
   */
  DatabaseExceptionCategory(String SQLState, HttpStatus httpStatus) {
    this.SQLState = SQLState;
    this.httpStatus = httpStatus;
  }

  /**
   * Map a SQLState code to the corresponding database exception category.
   *
   * @param SQLState the SQLState code to be mapped
   * @return the corresponding database exception category, which defaults to UNKNOWN
   */
  public static DatabaseExceptionCategory fromSQLState(String SQLState) {
    if (SQLState == null) {
      return UNKNOWN;
    }

    for (DatabaseExceptionCategory dbExceptionCategory : values()) {
      if (dbExceptionCategory.matchesSQLState(SQLState)) {
        return dbExceptionCategory;
      }
    }
    return UNKNOWN;
  }

  /**
   * Get the HTTP status corresponding to the database exception category.
   *
   * @return the HTTP status for the category
   */
  public HttpStatus getHttpStatus() {
    return httpStatus;
  }

  /**
   * Check whether the exception category matches a given SQL state.
   *
   * @param SQLState the SQL state to check with
   * @return true if the exception category matches the given SQL state, false otherwise
   * @throws IllegalArgumentException if the given SQL state is null
   */
  public boolean matchesSQLState(String SQLState) throws IllegalArgumentException {
    if (SQLState == null) {
      throw new IllegalArgumentException("Exception category cannot match with null");
    }
    return this.SQLState != null && this.SQLState.equals(SQLState);
  }
}
