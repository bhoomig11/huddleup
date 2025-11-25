package edu.northeastern.dharrguptab.huddleup.user.dto;

import java.time.Instant;

/**
 * Represents a lightweight view of an announcement associated with a user.
 *
 * @param announcementTitle the title of the announcement
 * @param sentAt the timestamp when the announcement was sent
 * @param readAt the timestamp when the user read the announcement (nullable)
 */
public record AnnouncementSummary(String announcementTitle, Instant sentAt, Instant readAt) {}

