package edu.northeastern.dharrguptab.huddleup.user.dto;

/**
 * Payload for an email update request.
 *
 * @param newEmail the new email address for the user
 */
public record EmailUpdate(String newEmail) {}

