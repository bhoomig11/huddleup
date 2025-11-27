package edu.northeastern.dharrguptab.huddleup.user.dto;

/**
 * Payload for filing a complaint for a booking.
 *
 * @param subject the subject or title of the complaint
 * @param description the textual description of the complaint
 */
public record ComplaintRequest(String subject, String description) {}

