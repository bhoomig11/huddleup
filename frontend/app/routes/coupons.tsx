import { data } from "react-router";
import type { Route } from "./+types/coupons";
import { fetchAllValidCoupons } from "~/api/coupon";
import type { CouponSummary } from "~/api/coupon";

export async function clientLoader({
  context,
  request,
}: Route.ClientLoaderArgs) {
  const response = await fetchAllValidCoupons();
  if (!response.ok) {
    throw data("Failed to fetch coupons", {
      status: response.status,
    });
  }

  const coupons = (await response.json()) as CouponSummary[];
  return coupons;
}
