export interface CouponDetail {
  couponId: number;
  couponCode: string;
  couponDescription: string;
  discountPercent: number;
  couponStartDate: string; // ISO date string
  couponEndDate: string; // ISO date string
  minBookingAmt: number | null;
}
