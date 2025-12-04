package edu.northeastern.dharrguptab.huddleup.user.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Represents a summary of a booking for a user.
 *
 * @param bookingId the ID of the booking
 * @param startTimeLocal the start time of the booking in the turf's local timezone
 * @param endTimeLocal the end time of the booking in the turf's local timezone
 * @param amount the amount paid to confirm the booking
 * @param complaintSubject the subject of the associated complaint if any
 * @param complaintDescription the description of the associated complaint if any
 * @param complaintFiledAtUtc the timestamp for when any existing complaint was filed (in UTC)
 * @param complaintResolvedAtUtc the timestamp for when any existing complaint was resolved (in UTC)
 * @param turfId the ID of the turf that was booked
 * @param turfName the name of the turf that was booked
 * @param username the username of the user who made the booking
 * @param maskedCardNumber the masked number of the card used to confirm the booking
 * @param couponId the ID of the coupon applied to the booking if any
 */
public record BookingSummary(
    int bookingId,
    LocalDateTime startTimeLocal,
    LocalDateTime endTimeLocal,
    BigDecimal amount,
    String complaintSubject,
    String complaintDescription,
    Instant complaintFiledAtUtc,
    Instant complaintResolvedAtUtc,
    int turfId,
    String turfName,
    String username,
    String maskedCardNumber,
    Integer couponId
) {}

