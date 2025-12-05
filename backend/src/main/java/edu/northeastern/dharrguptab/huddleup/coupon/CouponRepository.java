package edu.northeastern.dharrguptab.huddleup.coupon;

import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppErrorCode;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseExceptionCategory;
import edu.northeastern.dharrguptab.huddleup.coupon.dto.CouponDetail;
import edu.northeastern.dharrguptab.huddleup.coupon.exceptions.CouponErrorCode;
import edu.northeastern.dharrguptab.huddleup.coupon.exceptions.CouponException;
import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class CouponRepository {
  private final DataSource dataSource;

  public CouponRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Retrieve all coupons that are currently valid.
   *
   * @return list of valid coupon details
   */
  public List<CouponDetail> getAllValidCoupons() {
    String getAllValidCouponsQuery = "{CALL get_all_valid_coupons()}";
    List<CouponDetail> coupons = new ArrayList<>();

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getAllValidCouponsQuery);
        ResultSet rs = cs.executeQuery()) {
      while (rs.next()) {
        int couponId = rs.getInt("coupon_id");
        String couponCode = rs.getString("coupon_code");
        String couponDescription = rs.getString("coupon_description");
        int discountPercent = rs.getInt("discount_percent");
        Date sqlStartDate = rs.getDate("coupon_start_date");
        Date sqlEndDate = rs.getDate("coupon_end_date");
        BigDecimal minBookingAmt = rs.getBigDecimal("min_booking_amt");

        LocalDate startDate = sqlStartDate != null ? sqlStartDate.toLocalDate() : null;
        LocalDate endDate = sqlEndDate != null ? sqlEndDate.toLocalDate() : null;

        coupons.add(
            new CouponDetail(
                couponId, couponCode, couponDescription, discountPercent, startDate, endDate, minBookingAmt));
      }
      return coupons;
    } catch (SQLException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieves the details for a given coupon.
   *
   * @param couponId the ID of the coupon
   * @return the coupon's detail data
   * @throws CouponException if no such coupon is found
   */
  public CouponDetail getCoupon(int couponId) throws CouponException {
    String getCouponQuery = "{CALL get_coupon(?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getCouponQuery)) {
      cs.setInt("p_coupon_id", couponId);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          int id = rs.getInt("coupon_id");
          String couponCode = rs.getString("coupon_code");
          String couponDescription = rs.getString("coupon_description");
          int discountPercent = rs.getInt("discount_percent");
          Date sqlStartDate = rs.getDate("coupon_start_date");
          Date sqlEndDate = rs.getDate("coupon_end_date");
          BigDecimal minBookingAmt = rs.getBigDecimal("min_booking_amt");

          LocalDate startDate = sqlStartDate != null ? sqlStartDate.toLocalDate() : null;
          LocalDate endDate = sqlEndDate != null ? sqlEndDate.toLocalDate() : null;

          return new CouponDetail(
              id, couponCode, couponDescription, discountPercent, startDate, endDate, minBookingAmt);
        }
      }
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new CouponException(e, CouponErrorCode.INVALID_COUPON_ID);
      } else {
        throw new CouponException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return null;
  }
}

