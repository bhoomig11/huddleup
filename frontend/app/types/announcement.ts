/**
 * Represents a lightweight view of an announcement associated with a user.
 */
export interface AnnouncementSummary {
  announcementId: number;
  announcementTitle: string;
  sentAt: string; // ISO 8601 timestamp
  readAt: string | null; // ISO 8601 timestamp or null
}

/**
 * Represents detailed announcement information, including message content.
 */
export interface AnnouncementDetail {
  announcementTitle: string;
  announcementMessage: string;
  sentAt: string; // ISO 8601 timestamp
  readAt: string | null; // ISO 8601 timestamp or null
}

