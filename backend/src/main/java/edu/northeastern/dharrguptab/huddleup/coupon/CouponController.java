package edu.northeastern.dharrguptab.huddleup.coupon;

import edu.northeastern.dharrguptab.huddleup.coupon.dto.CouponDetail;
import edu.northeastern.dharrguptab.huddleup.coupon.dto.CouponSummary;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupon")
public class CouponController {
  private final CouponService couponService;

  public CouponController(CouponService couponService) {
    this.couponService = couponService;
  }

  /** Endpoint for getting all currently valid coupons. */
  @GetMapping
  public List<CouponSummary> getAllValidCoupons() {
    return couponService.getAllValidCoupons();
  }

  /**
   * Endpoint for getting a coupon by ID.
   *
   * @param coupon_id the ID of the coupon
   * @return the coupon's detail data
   */
  @GetMapping("/{coupon_id}")
  public CouponDetail getCoupon(@PathVariable int coupon_id) {
    CouponDetail couponDetail = couponService.getCoupon(coupon_id);
    return couponDetail;
  }
}

