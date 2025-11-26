package edu.northeastern.dharrguptab.huddleup.auth.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.northeastern.dharrguptab.huddleup.auth.exception.AuthErrorCode;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppError;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class AuthEntryPoint implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper;

  public AuthEntryPoint(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException)
      throws IOException {
    HttpStatus status = HttpStatus.UNAUTHORIZED;
    AppError error =
        new AppError(
            status.value(),
            status.getReasonPhrase(),
            AuthErrorCode.UNAUTHENTICATED.toCodeString(),
            authException.getMessage());

    response.setStatus(status.value());
    response.setContentType("application/json");
    objectMapper.writeValue(response.getOutputStream(), error);
  }
}
