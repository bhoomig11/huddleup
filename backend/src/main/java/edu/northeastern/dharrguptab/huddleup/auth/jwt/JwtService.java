package edu.northeastern.dharrguptab.huddleup.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  @Value("${jwt.expiration.ms}")
  private long expiration;

  @Value("${jwt.secret}")
  private String jwtSecret;

  private SecretKey secretKey;

  /** Initializes the key after the class is instantiated and the jwtSecret is injected. */
  @PostConstruct
  public void init() {
    this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
  }

  /**
   * Generate a JWT for a given user
   *
   * @param username the username of the given user
   * @return the generated JWT
   */
  public String generateToken(String username) {
    return Jwts.builder()
        .subject(username)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(secretKey)
        .compact();
  }

  /**
   * Extract the username encoded in a JWT.
   *
   * @param token the JWT containing the username
   * @return the username if found, {@code null} otherwise
   * @throws JwtException if the token is not valid
   */
  public String extractUsername(String token) throws JwtException {
    try {
      return parseToken(token).getSubject();
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  /**
   * Checks if a provided JWT is valid and belongs to a particular user.
   *
   * @param token the JWT to validate
   * @param userDetails the details of the user to validate against
   * @return true if the token is valid and belongs to the user, false otherwise
   */
  public boolean validateToken(String token, UserDetails userDetails) {
    Claims claims;
    try {
      claims = parseToken(token);
    } catch (Exception e) {
      return false;
    }

    boolean isUserValid = claims.getSubject().equals(userDetails.getUsername());
    boolean isExpired = claims.getExpiration().before(new Date());
    return isUserValid && !isExpired;
  }

  /**
   * Parse a JWT and extract the encoded payload.
   *
   * @param token the token to parse
   * @return the decoded JWT payload
   * @throws JwtException if the token is invalid
   * @throws IllegalArgumentException if the token is <code>null</code> or empty or only whitespace
   */
  private Claims parseToken(String token) throws JwtException {
    return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
  }
}
