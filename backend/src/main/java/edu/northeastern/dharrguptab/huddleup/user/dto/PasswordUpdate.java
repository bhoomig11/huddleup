package edu.northeastern.dharrguptab.huddleup.user.dto;

/**
 * Payload for a password update request.
 *
 * @param password the new password for the user
 */
public record PasswordUpdate(String password) {}

