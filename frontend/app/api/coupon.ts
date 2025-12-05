import { withBase } from "./base";

export async function fetchAllValidCoupons() {
  const response = await fetch(withBase("/api/coupon"));
  return response;
}

export async function fetchCouponDetail(couponId: number) {
  const response = await fetch(withBase(`/api/coupon/${couponId}`));
  return response;
}
