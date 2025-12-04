package edu.northeastern.dharrguptab.huddleup.turf.dto;

/**
 * Payload for booking a turf.
 *
 * @param date the date of the booking (yyyy-MM-dd format)
 * @param startTime the start time of the booking in local time (HH:mm format)
 * @param endTime the end time of the booking in local time (HH:mm format)
 * @param cardId the payment card ID
 * @param couponId the optional coupon ID to apply to the booking
 */
public record TurfBookingRequest(
    String date,
    String startTime,
    String endTime,
    int cardId,
    Integer couponId
) {}

