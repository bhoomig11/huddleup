package edu.northeastern.dharrguptab.huddleup.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Handles authentication exceptions and maps them to HTTP REST responses. */
@RestControllerAdvice
public class AuthExceptionAdvice {

  @ExceptionHandler(InvalidCredentialsException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public String invalidCredentialsHandler(InvalidCredentialsException ex) {
    return ex.getMessage();
  }

  @ExceptionHandler(UnauthenticatedException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  public String unauthenticatedHandler(UnauthenticatedException ex) {
    return ex.getMessage();
  }

  @ExceptionHandler(UnauthorizedException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public String unauthorizedHandler(UnauthorizedException ex) {
    return ex.getMessage();
  }
}
