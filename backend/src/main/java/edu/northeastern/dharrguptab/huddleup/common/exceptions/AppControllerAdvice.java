package edu.northeastern.dharrguptab.huddleup.common.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AppControllerAdvice {

  @ExceptionHandler(DatabaseException.class)
  public ResponseEntity<AppError> handleDatabaseException(DatabaseException ex) {
    DatabaseExceptionCategory databaseExceptionCategory = ex.getDatabaseExceptionCategory();
    HttpStatus httpStatus = databaseExceptionCategory.getHttpStatus();
    IAppErrorCode appErrorCode = ex.getAppErrorCode();

    AppError appError =
        new AppError(
            httpStatus.value(),
            httpStatus.getReasonPhrase(),
            appErrorCode.toCodeString(),
            ex.getMessage());

    return new ResponseEntity<>(appError, httpStatus);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<AppError> handleUnknownException(Exception ex) {
    AppError appError =
        new AppError(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
            AppErrorCode.UNKNOWN.toCodeString(),
            ex.getMessage());

    return new ResponseEntity<>(appError, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
