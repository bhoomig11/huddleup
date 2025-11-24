package edu.northeastern.dharrguptab.huddleup.user.dto;

/**
 * Payload for a username update request.
 *
 * @param newUsername the new username for the user
 */
public record UsernameUpdate(String newUsername) {}
