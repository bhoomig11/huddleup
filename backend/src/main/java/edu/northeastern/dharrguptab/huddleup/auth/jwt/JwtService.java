package edu.northeastern.dharrguptab.huddleup.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private static final long VALID_DURATION_MS = 1000 * 60 * 60; // 1 hour

  // TODO: Move this to environment variable
  private final SecretKey secretKey = Jwts.SIG.HS256.key().build();

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
        .expiration(new Date(System.currentTimeMillis() + VALID_DURATION_MS))
        .signWith(secretKey)
        .compact();
  }

  /**
   * Extract the username encoded in a JWT.
   *
   * @param token the JWT containing the username
   * @return the username if found, {@code null} otherwise
   */
  public String extractUsername(String token) {
    return parseToken(token).getSubject();
  }

  /**
   * Parse a JWT and extract the encoded payload.
   *
   * @param token the token to parse
   * @return the decoded JWT payload
   */
  private Claims parseToken(String token) throws JwtException {
    try {
      return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    } catch (JwtException e) {
      throw new JwtException(e.getMessage());
    }
  }

  public Claims extractAllClaims(String token) {
    return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
  }

  public String extractHeader(String token) {
    return Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .getHeader()
        .toString();
  }

  public String extractSignature(String token) {
    return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getSignature();
  }

  public Boolean validateToken(String token, UserDetails userDetails) throws JwtException {
    try {
      Claims claims = parseToken(token);
      boolean isUserValid = claims.getSubject().equals(userDetails.getUsername());
      boolean isExpired = claims.getExpiration().before(new Date());
      return isUserValid && !isExpired;
    } catch (JwtException e) {
      throw new JwtException(e.getMessage());
    }
  }
}
