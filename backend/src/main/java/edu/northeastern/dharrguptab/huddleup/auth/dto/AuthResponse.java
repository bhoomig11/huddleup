package edu.northeastern.dharrguptab.huddleup.auth.dto;

/**
 * Payload returned by authentication endpoints
 *
 * @param token JWT token generated on successful login (can be null for signup)
 */
public record AuthResponse(String token) {}
