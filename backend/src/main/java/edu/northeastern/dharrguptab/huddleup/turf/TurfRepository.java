package edu.northeastern.dharrguptab.huddleup.turf;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppErrorCode;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseExceptionCategory;
import edu.northeastern.dharrguptab.huddleup.turf.dto.ReviewRequest;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfData;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfReview;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfSummary;
import edu.northeastern.dharrguptab.huddleup.turf.exceptions.TurfErrorCode;
import edu.northeastern.dharrguptab.huddleup.turf.exceptions.TurfException;
import java.math.BigDecimal;
import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class TurfRepository {
  private final DataSource dataSource;

  /**
   * Constructs a new instance of the turf repository.
   *
   * @param dataSource the SQL DataSource used to obtain database connections
   */
  public TurfRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Retrieve all the turfs.
   *
   * @return list of all the turfs
   */
  public List<TurfSummary> getAllTurfs() {
    String getAllTurfsQuery = "{CALL get_all_turfs()}";
    List<TurfSummary> turfs = new ArrayList<>();

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getAllTurfsQuery)) {
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int turfId = rs.getInt("turf_id");
          String turfName = rs.getString("turf_name");
          String imageUrl = rs.getString("image_url");
          String sportName = rs.getString("sport_name");
          BigDecimal hourlyRate = rs.getBigDecimal("hourly_rate");
          String streetLine1 = rs.getString("addr_street_1");
          String streetLine2 = rs.getString("addr_street_2");
          String town = rs.getString("addr_town");
          String state = rs.getString("addr_state");
          String zipcode = rs.getString("addr_zip_code");
          BigDecimal turfRating = rs.getBigDecimal("avg_rating");
          int numberOfRatings = rs.getInt("number_of_ratings");
          turfs.add(
              new TurfSummary(
                  turfId,
                  turfName,
                  imageUrl,
                  sportName,
                  hourlyRate,
                  turfRating,
                  numberOfRatings,
                  new Address(streetLine1, streetLine2, town, state, zipcode)));
        }
      }
      return turfs;
    } catch (SQLException e) {
      throw new TurfException(e, AppErrorCode.UNKNOWN);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieves the details for a given turf.
   *
   * @param turfId the ID of the turf
   * @return the turf's data
   * @throws TurfException if no such turf is found
   */
  public TurfData getTurf(int turfId) throws TurfException {
    String getTurfQuery = "{CALL get_turf(?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getTurfQuery)) {
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          String addrStreet1 = rs.getString("addr_street_1");
          String addrStreet2 = rs.getString("addr_street_2");
          String addrTown = rs.getString("addr_town");
          String addrState = rs.getString("addr_state");
          String addrZipCode = rs.getString("addr_zip_code");

          Address address = new Address(addrStreet1, addrStreet2, addrTown, addrState, addrZipCode);

          int id = rs.getInt("turf_id");
          String turfName = rs.getString("turf_name");
          String turfDescription = rs.getString("turf_description");
          String sportName = rs.getString("sport_name");
          BigDecimal floorWidth = rs.getBigDecimal("floor_width");
          BigDecimal floorLength = rs.getBigDecimal("floor_length");
          String floorMaterial = rs.getString("floor_material");
          BigDecimal hourlyRate = rs.getBigDecimal("hourly_rate");
          Time opensAtLocalTime = rs.getTime("opens_at_local");
          Time closesAtLocalTime = rs.getTime("closes_at_local");
          String ianaTimezone = rs.getString("iana_timezone");
          BigDecimal averageRating = rs.getBigDecimal("avg_rating");
          int numberOfRatings = rs.getInt("number_of_ratings");

          TurfData turfData =
              new TurfData(
                  id,
                  turfName,
                  turfDescription,
                  sportName,
                  floorWidth,
                  floorLength,
                  floorMaterial,
                  hourlyRate,
                  averageRating,
                  numberOfRatings,
                  opensAtLocalTime,
                  closesAtLocalTime,
                  ianaTimezone,
                  address);

          return turfData;
        }
      }
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new TurfException(e, TurfErrorCode.INVALID_TURF_ID);
      } else {
        throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return null;
  }

  /**
   * Creates a booking for a user for a given turf.
   *
   * @param turfId the ID of the turf being booked
   * @param username the username of the user making the booking
   * @param startTimeUtc the start time of the booking in UTC
   * @param durationMins the duration of the booking in minutes
   * @param cardId the payment card ID
   * @param couponId the optional coupon ID to apply to the booking
   * @throws TurfException if the booking cannot be created
   */
  public void bookTurf(
      int turfId,
      String username,
      Instant startTimeUtc,
      int durationMins,
      int cardId,
      Integer couponId)
      throws TurfException {
    String bookTurfQuery = "{CALL book_turf(?, ?, ?, ?, ?, ?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(bookTurfQuery)) {
      cs.setInt("p_turf_id", turfId);
      cs.setString("p_username", username);
      cs.setTimestamp("p_start_time_UTC", Timestamp.from(startTimeUtc));
      cs.setInt("p_duration_mins", durationMins);
      cs.setInt("p_card_id", cardId);
      if (couponId != null) {
        cs.setInt("p_coupon_id", couponId);
      } else {
        cs.setNull("p_coupon_id", Types.INTEGER);
      }
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new TurfException(e, TurfErrorCode.INVALID_BOOKING_DATA);
        case RESOURCE_NOT_FOUND:
          throw new TurfException(e, TurfErrorCode.RESOURCE_NOT_FOUND);
        case RESOURCE_CONFLICT:
          throw new TurfException(e, TurfErrorCode.BOOKING_CONFLICT);
        default:
          throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Add a review for a turf.
   *
   * @param username the username of the user leaving the review
   * @param turfId the ID of the turf being reviewed
   * @param reviewRequest the review details
   * @throws TurfException if the review cannot be added
   */
  public void addReview(String username, int turfId, ReviewRequest reviewRequest)
      throws TurfException {
    String addReviewQuery = "{CALL add_review(?, ?, ?, ?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(addReviewQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_turf_id", turfId);
      cs.setInt("p_rating", reviewRequest.rating());
      cs.setString("p_review", reviewRequest.review());
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new TurfException(e, TurfErrorCode.INVALID_REVIEW_DATA);
        case RESOURCE_NOT_FOUND:
          throw new TurfException(e, TurfErrorCode.RESOURCE_NOT_FOUND);
        case RESOURCE_CONFLICT:
          throw new TurfException(e, TurfErrorCode.REVIEW_CONFLICT);
        default:
          throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /** Get all the reviews for a turf. */
  public List<TurfReview> getAllTurfReviews(int turfId) throws TurfException {
    String getTurfReviewsQuery = "{CALL get_turf_reviews(?)}";
    List<TurfReview> turfReviews = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getTurfReviewsQuery)) {
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          String review = rs.getString("review");
          int rating = rs.getInt("rating");
          String username = rs.getString("username");
          turfReviews.add(new TurfReview(review, rating, username));
        }
      }
      return turfReviews;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new TurfException(e, TurfErrorCode.INVALID_TURF_ID);
        case RESOURCE_NOT_FOUND:
          throw new TurfException(e, TurfErrorCode.RESOURCE_NOT_FOUND);
        default:
          throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Get all the images for a turf.
   *
   * @param turfId the turf ID
   * @return a list of image URLs for the turf
   * @throws TurfException if no such turf exists
   */
  public List<String> getAllTurfImages(int turfId) throws TurfException {
    String getTurfImagesQuery = "{CALL get_turf_images(?)}";
    List<String> turfImages = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getTurfImagesQuery)) {
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int index = rs.getInt("image_index");
          String imageUrl = rs.getString("image_url");
          turfImages.add(index, imageUrl);
        }
      }
      return turfImages;
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new TurfException(e, TurfErrorCode.INVALID_TURF_ID);
      } else {
        throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
