package edu.northeastern.dharrguptab.huddleup.coupon;

import edu.northeastern.dharrguptab.huddleup.coupon.dto.CouponDetail;
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
   * @return list of valid coupon details
   */
  public List<CouponDetail> getAllValidCoupons() {
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

