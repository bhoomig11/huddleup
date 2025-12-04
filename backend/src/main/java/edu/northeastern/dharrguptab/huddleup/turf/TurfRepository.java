package edu.northeastern.dharrguptab.huddleup.turf;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppErrorCode;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseExceptionCategory;
import edu.northeastern.dharrguptab.huddleup.turf.dto.ReviewRequest;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfData;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfFeature;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfReview;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfSummary;
import edu.northeastern.dharrguptab.huddleup.turf.exceptions.TurfErrorCode;
import edu.northeastern.dharrguptab.huddleup.turf.exceptions.TurfException;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
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
   * @param date the date of the booking (yyyy-MM-dd format, local time)
   * @param startTime the start time of the booking (HH:mm format, local time)
   * @param endTime the end time of the booking (HH:mm format, local time)
   * @param cardId the payment card ID
   * @param couponId the optional coupon ID to apply to the booking
   * @return the ID of the newly created booking
   * @throws TurfException if the booking cannot be created
   */
  public int bookTurf(
      int turfId,
      String username,
      String date,
      String startTime,
      String endTime,
      int cardId,
      Integer couponId)
      throws TurfException {
    String bookTurfQuery = "{CALL book_turf(?, ?, ?, ?, ?, ?, ?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(bookTurfQuery)) {
      cs.setInt("p_turf_id", turfId);
      cs.setString("p_username", username);
      cs.setDate("p_date", Date.valueOf(java.time.LocalDate.parse(date)));
      cs.setTime("p_start_time", Time.valueOf(java.time.LocalTime.parse(startTime)));
      cs.setTime("p_end_time", Time.valueOf(java.time.LocalTime.parse(endTime)));
      cs.setInt("p_card_id", cardId);
      if (couponId != null) {
        cs.setInt("p_coupon_id", couponId);
      } else {
        cs.setNull("p_coupon_id", Types.INTEGER);
      }
      
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          return rs.getInt("booking_id");
        }
      }
      throw new TurfException(
          new SQLException("Booking created but no booking_id returned"),
          TurfErrorCode.INVALID_BOOKING_DATA);
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

  /**
   * Delete a review for a turf.
   *
   * @param username the username of the user deleting the review
   * @param turfId the ID of the turf
   * @throws TurfException if the review cannot be deleted
   */
  public void deleteReview(String username, int turfId) throws TurfException {
    String deleteReviewQuery = "{CALL delete_user_review(?, ?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(deleteReviewQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_turf_id", turfId);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new TurfException(e, TurfErrorCode.INVALID_REVIEW_DATA);
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
   * Update a review for a turf.
   *
   * @param username the username of the user updating the review
   * @param turfId the ID of the turf being reviewed
   * @param reviewRequest the review details
   * @throws TurfException if the review cannot be updated
   */
  public void updateReview(String username, int turfId, ReviewRequest reviewRequest)
      throws TurfException {
    String updateReviewQuery = "{CALL update_user_review(?, ?, ?, ?)}";

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(updateReviewQuery)) {
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
        default:
          throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /** Get all the reviews for a turf. */
  public List<TurfReview> getAllTurfReviews(int turfId) throws TurfException {
    String getTurfReviewsQuery = "{CALL get_all_turf_reviews(?)}";
    List<TurfReview> turfReviews = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getTurfReviewsQuery)) {
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          String review = rs.getString("review");
          int rating = rs.getInt("rating");
          String username = rs.getString("username");
          turfReviews.add(new TurfReview(username, rating, review));
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
   * @return a list of image URLs for the turf, ordered by image_index
   * @throws TurfException if no such turf exists
   */
  public List<String> getAllTurfImages(int turfId) throws TurfException {
    String getTurfImagesQuery = "{CALL get_turf_images(?)}";
    TreeMap<Integer, String> imageMap = new TreeMap<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getTurfImagesQuery)) {
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int index = rs.getInt("image_index");
          String imageUrl = rs.getString("image_url");
          imageMap.put(index, imageUrl);
        }
      }
      return new ArrayList<>(imageMap.values());
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

  /**
   * Get all the features for a turf.
   *
   * @param turfId the turf ID
   * @return a list of features for the turf
   * @throws TurfException if no such turf exists
   */
  public List<TurfFeature> getAllTurfFeatures(int turfId) throws TurfException {
    String getTurfFeaturesQuery = "{CALL get_turf_features(?)}";
    List<TurfFeature> features = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getTurfFeaturesQuery)) {
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          String featureName = rs.getString("feature_name");
          String featureDescription = rs.getString("feature_description");
          features.add(new TurfFeature(featureName, featureDescription));
        }
      }
      return features;
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

  /**
   * Get available start times for a turf on a given date.
   *
   * @param turfId the ID of the turf
   * @param date the date to check availability for
   * @return list of available start times as strings (HH:mm:ss format)
   * @throws TurfException if the turf doesn't exist or if there's a database error
   */
  public List<String> getAvailableStartTimes(int turfId, LocalDate date) throws TurfException {
    String getStartTimesQuery = "{CALL get_available_start_times(?, ?)}";
    List<String> startTimes = new ArrayList<>();

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getStartTimesQuery)) {
      cs.setInt("p_turf_id", turfId);
      cs.setDate("p_date", Date.valueOf(date));
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          Time time = rs.getTime("start_time_local");
          startTimes.add(time.toString());
        }
      }
      return startTimes;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new TurfException(e, TurfErrorCode.INVALID_BOOKING_DATA);
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
   * Get available end times for a turf on a given date and start time.
   *
   * @param turfId the ID of the turf
   * @param date the date to check availability for
   * @param startTime the selected start time (HH:mm:ss format)
   * @return list of available end times as strings (HH:mm:ss format)
   * @throws TurfException if the turf doesn't exist or if there's a database error
   */
  public List<String> getAvailableEndTimes(int turfId, LocalDate date, String startTime)
      throws TurfException {
    String getEndTimesQuery = "{CALL get_available_end_times(?, ?, ?)}";
    List<String> endTimes = new ArrayList<>();

    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getEndTimesQuery)) {
      cs.setInt("p_turf_id", turfId);
      cs.setDate("p_date", Date.valueOf(date));
      cs.setTime("p_start_time", Time.valueOf(startTime));
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          Time time = rs.getTime("end_time_local");
          endTimes.add(time.toString());
        }
      }
      return endTimes;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new TurfException(e, TurfErrorCode.INVALID_BOOKING_DATA);
        case RESOURCE_NOT_FOUND:
          throw new TurfException(e, TurfErrorCode.RESOURCE_NOT_FOUND);
        default:
          throw new TurfException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
