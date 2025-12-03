package edu.northeastern.dharrguptab.huddleup.user.dto;

/**
 * Response containing the latest booking for a user at a turf.
 *
 * @param latestBooking the latest booking if it exists, null otherwise
 */
public record LatestBookingResponse(BookingSummary latestBooking) {}

