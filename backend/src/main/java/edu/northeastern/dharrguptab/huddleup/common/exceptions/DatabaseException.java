package edu.northeastern.dharrguptab.huddleup.common.exceptions;

import java.sql.SQLException;

public abstract class DatabaseException extends RuntimeException implements IDatabaseException {
  protected final SQLException sqlException;

  public DatabaseException(SQLException sqlException) {
    super(sqlException.getMessage());
    this.sqlException = sqlException;
  }

  @Override
  public DatabaseExceptionCategory getDatabaseExceptionCategory() {
    return DatabaseExceptionCategory.fromSQLState(sqlException.getSQLState());
  }
}
