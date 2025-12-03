package edu.northeastern.dharrguptab.huddleup.turf.dto;

import java.time.Instant;

/**
 * Payload for booking a turf.
 *
 * @param startTimeUtc the start time of the booking in UTC
 * @param endTimeUtc the end time of the booking in UTC
 * @param cardId the payment card ID
 * @param couponId the optional coupon ID to apply to the booking
 */
public record TurfBookingRequest(
    Instant startTimeUtc,
    Instant endTimeUtc,
    int cardId,
    Integer couponId
) {}

