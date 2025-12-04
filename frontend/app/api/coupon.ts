import { withBase } from "./base";

export interface CouponSummary {
  couponId: number;
  couponCode: string;
  couponDescription: string;
  discountPercent: number;
}

export async function fetchAllValidCoupons() {
  const response = await fetch(withBase("/api/coupon"));
  return response;
}
