package edu.northeastern.dharrguptab.huddleup.user.exceptions;

import java.sql.SQLException;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseAccessException;

public class UserNotFoundException extends DatabaseAccessException {
  public UserNotFoundException(SQLException sqlException) {
    super(sqlException);
  }
}
