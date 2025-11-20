package edu.northeastern.dharrguptab.huddleup.user;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import edu.northeastern.dharrguptab.huddleup.user.exceptions.UserNotFoundException;

@RestControllerAdvice
public class UserControllerAdvice {
  @ExceptionHandler(UserNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public String handleUserNotFound(UserNotFoundException ex) {
    return ex.getMessage();
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public String handleDefaultException(Exception ex) {
    return ex.getMessage();
  }
}
