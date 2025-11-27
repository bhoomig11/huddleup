package edu.northeastern.dharrguptab.huddleup.coupon.dto;

/**
 * Represents a summary view of a coupon that is valid for use.
 *
 * @param couponId the unique identifier of the coupon
 * @param couponCode the user-visible coupon code
 * @param couponDescription the description of the coupon
 * @param discountPercent the discount percentage applied by the coupon
 */
public record CouponSummary(
    int couponId, String couponCode, String couponDescription, int discountPercent) {}


