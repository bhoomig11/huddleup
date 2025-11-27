package edu.northeastern.dharrguptab.huddleup.coupon.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Represents detailed information about a coupon.
 *
 * @param couponId the unique identifier of the coupon
 * @param couponCode the user-visible coupon code
 * @param couponDescription the description of the coupon
 * @param discountPercent the discount percentage applied by the coupon
 * @param couponStartDate the start date when the coupon becomes valid
 * @param couponEndDate the end date when the coupon expires
 * @param minBookingAmt the minimum booking amount required to use this coupon (nullable)
 */
public record CouponDetail(
    int couponId,
    String couponCode,
    String couponDescription,
    int discountPercent,
    LocalDate couponStartDate,
    LocalDate couponEndDate,
    BigDecimal minBookingAmt) {}

