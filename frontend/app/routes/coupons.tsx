import { data } from "react-router";
import { fetchAllValidCoupons } from "~/api/coupon";
import type { CouponSummary } from "~/api/coupon";

export async function clientLoader() {
  const response = await fetchAllValidCoupons();
  if (!response.ok) {
    throw data("Failed to fetch coupons", {
      status: response.status,
    });
  }

  const coupons = (await response.json()) as CouponSummary[];
  return coupons;
}
