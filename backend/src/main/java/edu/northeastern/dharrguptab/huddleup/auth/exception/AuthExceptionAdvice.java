package edu.northeastern.dharrguptab.huddleup.auth.exception;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Handles authentication exceptions and maps them to HTTP REST responses. */
@RestControllerAdvice
public class AuthExceptionAdvice {

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<AppError> invalidCredentialsHandler(InvalidCredentialsException ex) {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    AppError error =
        new AppError(
            status.value(),
            status.getReasonPhrase(),
            AuthErrorCode.INVALID_CREDENTIALS.toCodeString(),
            ex.getMessage());
    return new ResponseEntity<>(error, status);
  }

  @ExceptionHandler(UnauthenticatedException.class)
  public ResponseEntity<AppError> unauthenticatedHandler(UnauthenticatedException ex) {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    AppError error =
        new AppError(
            status.value(),
            status.getReasonPhrase(),
            AuthErrorCode.UNAUTHENTICATED.toCodeString(),
            ex.getMessage());
    return new ResponseEntity<>(error, status);
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<AppError> unauthorizedHandler(UnauthorizedException ex) {
    HttpStatus status = HttpStatus.FORBIDDEN;
    AppError error =
        new AppError(
            status.value(),
            status.getReasonPhrase(),
            AuthErrorCode.UNAUTHORIZED.toCodeString(),
            ex.getMessage());
    return new ResponseEntity<>(error, status);
  }
}
