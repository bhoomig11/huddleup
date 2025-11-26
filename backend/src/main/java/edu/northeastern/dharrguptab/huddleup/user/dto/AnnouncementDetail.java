package edu.northeastern.dharrguptab.huddleup.user.dto;

import java.time.Instant;

/**
 * Represents detailed announcement information, including message content.
 *
 * @param announcementTitle the title of the announcement
 * @param announcementMessage the detailed message body
 * @param sentAt the timestamp when the announcement was sent
 * @param readAt the timestamp when the user read the announcement (nullable)
 */
public record AnnouncementDetail(
    String announcementTitle, String announcementMessage, Instant sentAt, Instant readAt) {}

