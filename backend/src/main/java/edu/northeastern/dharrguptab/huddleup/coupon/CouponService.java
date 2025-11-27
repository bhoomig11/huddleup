package edu.northeastern.dharrguptab.huddleup.coupon;

import edu.northeastern.dharrguptab.huddleup.coupon.dto.CouponDetail;
import edu.northeastern.dharrguptab.huddleup.coupon.dto.CouponSummary;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CouponService {
  private final CouponRepository couponRepository;

  public CouponService(CouponRepository couponRepository) {
    this.couponRepository = couponRepository;
  }

  /**
   * Get all coupons that are currently valid.
   *
   * @return list of valid coupon summaries
   */
  public List<CouponSummary> getAllValidCoupons() {
    return couponRepository.getAllValidCoupons();
  }

  /**
   * Get the detail data for a coupon.
   *
   * @param couponId the ID of the coupon
   * @return the coupon's detail data
   */
  public CouponDetail getCoupon(int couponId) {
    return couponRepository.getCoupon(couponId);
  }
}

