package edu.northeastern.dharrguptab.huddleup.auth.dto;

/**
 * Payload for a login request.
 *
 * @param username the username of the user attempting to log in
 * @param password the raw, non-encoded password of the user attempting to log in
 */
public record UserLoginCredentials(String username, String password) {}
