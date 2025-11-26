package edu.northeastern.dharrguptab.huddleup.auth.jwt;

import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthenticatedException;
import edu.northeastern.dharrguptab.huddleup.auth.service.AppUserService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class UserJwtFilter extends OncePerRequestFilter {
  private static final String USER_URL_PATH_ANT_PATTERN = "/api/user/";

  private final JwtService userJwtService;
  private final AppUserService appUserService;
  private final RequestMatcher requestMatcher;

  /**
   * Create a filter that attempts to authenticate incoming HTTP requests based on a JWT.
   *
   * @param jwtService service that provides utilities to work with JWTs
   * @param appUserService provides the required user details
   */
  public UserJwtFilter(JwtService jwtService, AppUserService appUserService) {
    this.userJwtService = jwtService;
    this.appUserService = appUserService;
    this.requestMatcher = request -> request.getRequestURI().startsWith(USER_URL_PATH_ANT_PATTERN);
  }

  @Override
  public void doFilterInternal(
      @NotNull HttpServletRequest request,
      @NotNull HttpServletResponse response,
      @NotNull FilterChain filterChain)
      throws ServletException, IOException, UnauthenticatedException {
    try {
      String AUTHORIZATION_HEADER_KEY = "Authorization";
      String AUTHORIZATION_HEADER_VALUE_PREFIX = "Bearer ";
      String authHeader = request.getHeader(AUTHORIZATION_HEADER_KEY);

      boolean isUserRequest = requestMatcher.matches(request);
      boolean isAuthenticatedRequest =
          authHeader != null && authHeader.startsWith(AUTHORIZATION_HEADER_VALUE_PREFIX);

      if (!isUserRequest || !isAuthenticatedRequest) {
        filterChain.doFilter(request, response);
        return;
      }

      String token = authHeader.substring(AUTHORIZATION_HEADER_VALUE_PREFIX.length());
      String username = userJwtService.extractUsername(token);

      if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = appUserService.loadUserByUsername(username);
        boolean isTokenValid = userJwtService.validateToken(token, userDetails);

        if (isTokenValid) {
          UsernamePasswordAuthenticationToken authenticationToken =
              new UsernamePasswordAuthenticationToken(
                  userDetails, null, userDetails.getAuthorities());
          SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }
      }
      filterChain.doFilter(request, response);
    } catch (JwtException e) {
      // Invalid token - continue without authentication, Spring Security will handle it
      filterChain.doFilter(request, response);
    }
  }
}
