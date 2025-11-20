package edu.northeastern.dharrguptab.huddleup.common.exceptions;

import java.sql.SQLException;

public class DatabaseAccessException extends RuntimeException {
  protected SQLException sqlException;

  public DatabaseAccessException(SQLException sqlException) {
    super(sqlException.getMessage());
    this.sqlException = sqlException;
  }
}
