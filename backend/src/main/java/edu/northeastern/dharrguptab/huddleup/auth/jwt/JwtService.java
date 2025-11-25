package edu.northeastern.dharrguptab.huddleup.auth.jwt;

import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthenticatedException;
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

  /**
   * Initializes the key after the class is instantiated and the jwtSecret is injected.
   **/
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
      throw new UnauthenticatedException();
    }
  }
}
