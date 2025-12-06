package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.auth.dto.UserCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.exception.InvalidCredentialsException;
import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppErrorCode;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseExceptionCategory;
import edu.northeastern.dharrguptab.huddleup.user.dto.*;
import edu.northeastern.dharrguptab.huddleup.user.exceptions.BookingErrorCode;
import edu.northeastern.dharrguptab.huddleup.user.exceptions.BookingException;
import edu.northeastern.dharrguptab.huddleup.user.exceptions.UserErrorCode;
import edu.northeastern.dharrguptab.huddleup.user.exceptions.UserException;
import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

/**
 * Represents a repository that provides methods to interact with users, including querying and
 * executing stored procedures associated with user data.
 */
@Repository
public class UserRepository {
  private final DataSource dataSource;

  /**
   * Constructs a new instance of the user repository.
   *
   * @param dataSource the SQL DataSource used to obtain database connections
   */
  public UserRepository(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Retrieve the login details for a given user.
   *
   * @param username the username of the user
   * @return the user's profile data
   */
  public UserCredentials getLoginUser(String username) throws InvalidCredentialsException {
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall("{CALL get_user_login_details(?)}"); ) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          String u = rs.getString("username");
          String hash = rs.getString("password_hash");

          return new UserCredentials(u, hash);
        }
      }
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());
      if (Objects.requireNonNull(databaseExceptionCategory)
          == DatabaseExceptionCategory.RESOURCE_NOT_FOUND) {
        throw new InvalidCredentialsException();
      }
      throw new UserException(e, AppErrorCode.UNKNOWN);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return null;
  }

  /**
   * Creates a new user
   *
   * @param username username of the user to be created
   * @param passwordHash hashed password of the user to be created
   * @param firstName first name of the user to be created
   * @param lastName last name of the user to be created
   * @param email email address of the user to be created
   * @param birthDate birth date of the user to be created
   * @param address the address of the user to be created
   */
  public void createNewUser(
      String username,
      String passwordHash,
      String firstName,
      String lastName,
      String email,
      LocalDate birthDate,
      Address address) {
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs =
            connection.prepareCall("{CALL create_new_user(?,?,?,?,?,?,?,?,?,?,?)}")) {
      cs.setString("p_username", username);
      cs.setString("p_password_hash", passwordHash);
      cs.setString("p_first_name", firstName);
      cs.setString("p_last_name", lastName);
      cs.setString("p_email", email);
      cs.setDate("p_birth_date", Date.valueOf(birthDate));
      cs.setString("p_addr_street_1", address.streetLine1());
      cs.setString("p_addr_street_2", address.streetLine2());
      cs.setString("p_addr_town", address.town());
      cs.setString("p_addr_state", address.state());
      cs.setString("p_addr_zip_code", address.zipcode());
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());
      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USER_FIELD);
        case RESOURCE_CONFLICT:
          throw new UserException(e, UserErrorCode.USERNAME_OR_EMAIL_TAKEN);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve the profile details for a given user.
   *
   * @param username the username of the user
   * @return the user's profile data
   * @throws UserException if no such user is found
   */
  public UserProfile getUserProfile(String username) throws UserException {
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall("{CALL get_user_profile(?)}")) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          String addrStreet1 = rs.getString("addr_street_1");
          String addrStreet2 = rs.getString("addr_street_2");
          String addrTown = rs.getString("addr_town");
          String addrState = rs.getString("addr_state");
          String addrZipCode = rs.getString("addr_zip_code");

          Address address = new Address(addrStreet1, addrStreet2, addrTown, addrState, addrZipCode);

          String actualUsername = rs.getString("username");
          String firstName = rs.getString("first_name");
          String lastName = rs.getString("last_name");
          String email = rs.getString("email");
          Date sqlBirthDate = rs.getDate("birth_date");
          LocalDate birthDate = sqlBirthDate != null ? sqlBirthDate.toLocalDate() : null;

          UserProfile userProfile =
              new UserProfile(actualUsername, firstName, lastName, email, birthDate, address);

          return userProfile;
        }
      }
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
      } else {
        throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return null;
  }

  /**
   * Update a user's profile details stored in the database.
   *
   * @param username the username of the user
   * @param userProfileUpdate the fields to be updated
   * @throws UserException if no such user is found
   */
  public void updateUserProfile(String username, UserProfileUpdate userProfileUpdate)
      throws UserException {
    String updateUserProfileQuery = "{CALL update_user_profile(?, ?, ?, ?, ?, ?, ?, ?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(updateUserProfileQuery)) {
      cs.setString("p_username", username);
      cs.setString("p_first_name", userProfileUpdate.firstName());
      cs.setString("p_last_name", userProfileUpdate.lastName());
      cs.setDate("p_birth_date", Date.valueOf(userProfileUpdate.birthDate()));
      
      // Handle null address
      if (userProfileUpdate.address() == null) {
        cs.setString("p_addr_street_1", null);
        cs.setString("p_addr_street_2", null);
        cs.setString("p_addr_town", null);
        cs.setString("p_addr_state", null);
        cs.setString("p_addr_zip_code", null);
      } else {
        cs.setString("p_addr_street_1", userProfileUpdate.address().streetLine1());
        cs.setString("p_addr_street_2", userProfileUpdate.address().streetLine2());
        cs.setString("p_addr_town", userProfileUpdate.address().town());
        cs.setString("p_addr_state", userProfileUpdate.address().state());
        cs.setString("p_addr_zip_code", userProfileUpdate.address().zipcode());
      }
      cs.executeUpdate();
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
      } else {
        throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Update the username for a user.
   *
   * @param currentUsername the current username of the user
   * @param newUsername the new username of the user
   * @throws UserException if no such user with the current username is found
   */
  public void updateUsername(String currentUsername, String newUsername) throws UserException {
    String updateUsernameQuery = "{CALL update_username(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(updateUsernameQuery)) {
      cs.setString("p_current_username", currentUsername);
      cs.setString("p_new_username", newUsername);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USERNAME);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        case RESOURCE_CONFLICT:
          throw new UserException(e, UserErrorCode.USERNAME_TAKEN);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Update the password hash for a user.
   *
   * @param username the username of the user
   * @param passwordHash the new password hash for the user
   * @throws UserException if no such user is found or if the password hash is invalid
   */
  public void updatePassword(String username, String passwordHash) throws UserException {
    String updatePasswordQuery = "{CALL update_user_password(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(updatePasswordQuery)) {
      cs.setString("p_username", username);
      cs.setString("p_password_hash", passwordHash);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_PASSWORD);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Update the email address for a user.
   *
   * @param username the username of the user
   * @param email the new email address of the user
   * @throws UserException if no such user is found, if the email is invalid, or if the email is
   *     already in use
   */
  public void updateEmail(String username, String email) throws UserException {
    String updateEmailQuery = "{CALL update_user_email(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(updateEmailQuery)) {
      cs.setString("p_username", username);
      cs.setString("p_email", email);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_EMAIL);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        case RESOURCE_CONFLICT:
          throw new UserException(e, UserErrorCode.EMAIL_TAKEN);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Delete a user from the database.
   *
   * @param username the username of the user to delete
   * @throws UserException if no such user exists
   */
  public void deleteUser(String username) throws UserException {
    String deleteUserQuery = "{CALL delete_user(?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(deleteUserQuery)) {
      cs.setString("p_username", username);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Add a new card detail for a user.
   *
   * @param username the username of the user
   * @param newCardDetail the card detail information to add
   * @throws UserException if no such user exists or if the card details are invalid
   */
  public void addCardDetail(String username, NewCardDetail newCardDetail) throws UserException {
    String addCardDetailQuery = "{CALL add_user_card_detail(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(addCardDetailQuery)) {
      Address billingAddress = newCardDetail.billingAddress();

      cs.setString("p_username", username);
      cs.setString("p_card_number", newCardDetail.cardNumber());
      cs.setString("p_name_on_card", newCardDetail.nameOnCard());
      cs.setString("p_expiry_month", newCardDetail.expiryMonth());
      cs.setString("p_expiry_year", newCardDetail.expiryYear());
      cs.setString("p_addr_street_1", billingAddress.streetLine1());
      cs.setString("p_addr_street_2", billingAddress.streetLine2());
      cs.setString("p_addr_town", billingAddress.town());
      cs.setString("p_addr_state", billingAddress.state());
      cs.setString("p_addr_zip_code", billingAddress.zipcode());
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_CARD_DETAIL);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Delete a card detail for a user.
   *
   * @param username the username of the user
   * @param cardId the ID of the card to delete
   * @throws UserException if no such card exists for the user
   */
  public void deleteCardDetail(String username, int cardId) throws UserException {
    String deleteCardDetailQuery = "{CALL delete_user_card_detail(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(deleteCardDetailQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_card_id", cardId);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.CARD_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public List<CardDetail> getAllCardDetails(String username) throws UserException {
    String getAllCardDetailsQuery = "{CALL get_all_user_card_details(?)}";
    List<CardDetail> allNewCardDetails = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getAllCardDetailsQuery)) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int cardId = rs.getInt("card_id");
          String cardNumber = rs.getString("card_number");
          String name = rs.getString("name_on_card");
          Date expiryDate = rs.getDate("expiry_date");
          String streetLine1 = rs.getString("addr_street_1");
          String streetLine2 = rs.getString("addr_street_2");
          String town = rs.getString("addr_town");
          String state = rs.getString("addr_state");
          String zipCode = rs.getString("addr_zip_code");
          allNewCardDetails.add(
              new CardDetail(
                  cardId,
                  cardNumber,
                  name,
                  expiryDate,
                  new Address(streetLine1, streetLine2, town, state, zipCode)));
        }
        return allNewCardDetails;
      }
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USERNAME);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve all announcements for a user.
   *
   * @param username the username of the user
   * @return the list of announcements
   */
  public List<AnnouncementSummary> getAllAnnouncements(String username) {
    String getAnnouncementsQuery = "{CALL get_all_user_announcements(?)}";
    List<AnnouncementSummary> announcements = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getAnnouncementsQuery)) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int announcementId = rs.getInt("announcement_id");
          String title = rs.getString("announcement_title");
          Instant sentAt = toInstantOrNull(rs.getTimestamp("sent_at"));
          Instant readAt = toInstantOrNull(rs.getTimestamp("read_at"));
          announcements.add(new AnnouncementSummary(announcementId, title, sentAt, readAt));
        }
      }
      return announcements;
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.VALIDATION_ERROR.matchesSQLState(e.getSQLState())) {
        throw new UserException(e, UserErrorCode.INVALID_USERNAME);
      }
      throw new UserException(e, AppErrorCode.UNKNOWN);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve a specific announcement for a user.
   *
   * @param username the username of the user
   * @param announcementId the announcement identifier
   * @return the announcement detail
   */
  public AnnouncementDetail getAnnouncement(String username, int announcementId) {
    String getAnnouncementQuery = "{CALL get_user_announcement(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getAnnouncementQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_announcement_id", announcementId);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          String title = rs.getString("announcement_title");
          String message = rs.getString("announcement_message");
          Instant sentAt = toInstantOrNull(rs.getTimestamp("sent_at"));
          Instant readAt = toInstantOrNull(rs.getTimestamp("read_at"));
          return new AnnouncementDetail(title, message, sentAt, readAt);
        }
      }
      return null;
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new UserException(e, UserErrorCode.ANNOUNCEMENT_NOT_FOUND);
      }
      throw new UserException(e, AppErrorCode.UNKNOWN);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Mark a single announcement as read for a user.
   *
   * @param username the username of the user
   * @param announcementId the announcement identifier
   */
  public void markAnnouncementAsRead(String username, int announcementId) {
    String markAnnouncementQuery = "{CALL mark_announcement_as_read(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(markAnnouncementQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_announcement_id", announcementId);
      cs.executeUpdate();
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new UserException(e, UserErrorCode.ANNOUNCEMENT_NOT_FOUND);
      }
      throw new UserException(e, AppErrorCode.UNKNOWN);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Mark all announcements as read for a user.
   *
   * @param username the username of the user
   */
  public void markAllAnnouncementsAsRead(String username) {
    String markAllAnnouncementsQuery = "{CALL mark_all_announcements_as_read(?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(markAllAnnouncementsQuery)) {
      cs.setString("p_username", username);
      cs.executeUpdate();
    } catch (SQLException e) {
      if (DatabaseExceptionCategory.RESOURCE_NOT_FOUND.matchesSQLState(e.getSQLState())) {
        throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
      }
      throw new UserException(e, AppErrorCode.UNKNOWN);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve all bookings for a user.
   *
   * @param username the username of the user
   * @return the list of bookings
   */
  public List<BookingSummary> getAllUserBookings(String username) {
    String getAllBookingsQuery = "{CALL get_all_user_bookings(?)}";
    List<BookingSummary> bookings = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getAllBookingsQuery)) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int bookingId = rs.getInt("booking_id");
          LocalDateTime startTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("start_time_local"));
          LocalDateTime endTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("end_time_local"));
          BigDecimal amount = rs.getBigDecimal("amount");
          String complaintSubject = rs.getString("complaint_subject");
          String complaintDescription = rs.getString("complaint_description");
          Instant complaintFiledAtUtc = toInstantOrNull(rs.getTimestamp("complaint_filed_at_utc"));
          Instant complaintResolvedAtUtc =
              toInstantOrNull(rs.getTimestamp("complaint_resolved_at_utc"));
          int turfId = rs.getInt("turf_id");
          String turfName = rs.getString("turf_name");
          String bookingUsername = rs.getString("username");
          String maskedCardNumber = rs.getString("masked_card_number");
          Integer couponId = rs.getObject("coupon_id", Integer.class);

          bookings.add(
              new BookingSummary(
                  bookingId,
                  startTimeLocal,
                  endTimeLocal,
                  amount,
                  complaintSubject,
                  complaintDescription,
                  complaintFiledAtUtc,
                  complaintResolvedAtUtc,
                  turfId,
                  turfName,
                  bookingUsername,
                  maskedCardNumber,
                  couponId));
        }
      }
      return bookings;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USERNAME);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve a specific booking for a user.
   *
   * @param username the username of the user
   * @param bookingId the booking identifier
   * @return the booking detail
   */
  public BookingSummary getUserBooking(String username, int bookingId) {
    String getUserBookingQuery = "{CALL get_user_booking(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getUserBookingQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_booking_id", bookingId);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          int bookingIdResult = rs.getInt("booking_id");
          LocalDateTime startTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("start_time_local"));
          LocalDateTime endTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("end_time_local"));
          BigDecimal amount = rs.getBigDecimal("amount");
          String complaintSubject = rs.getString("complaint_subject");
          String complaintDescription = rs.getString("complaint_description");
          Instant complaintFiledAtUtc = toInstantOrNull(rs.getTimestamp("complaint_filed_at_utc"));
          Instant complaintResolvedAtUtc =
              toInstantOrNull(rs.getTimestamp("complaint_resolved_at_utc"));
          int turfId = rs.getInt("turf_id");
          String turfName = rs.getString("turf_name");
          String bookingUsername = rs.getString("username");
          String maskedCardNumber = rs.getString("masked_card_number");
          Integer couponId = rs.getObject("coupon_id", Integer.class);

          return new BookingSummary(
              bookingIdResult,
              startTimeLocal,
              endTimeLocal,
              amount,
              complaintSubject,
              complaintDescription,
              complaintFiledAtUtc,
              complaintResolvedAtUtc,
              turfId,
              turfName,
              bookingUsername,
              maskedCardNumber,
              couponId);
        }
      }
      return null;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USERNAME);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.BOOKING_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * File a complaint for a user's booking.
   *
   * @param username the username of the user filing the complaint
   * @param bookingId the booking ID for which the complaint is being filed
   * @param complaintRequest the complaint details
   * @throws UserException if the complaint cannot be filed
   */
  public void fileComplaint(String username, int bookingId, ComplaintRequest complaintRequest)
      throws UserException {
    String fileComplaintQuery = "{CALL file_complaint(?, ?, ?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(fileComplaintQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_booking_id", bookingId);
      cs.setString("p_c_subject", complaintRequest.subject());
      cs.setString("p_c_description", complaintRequest.description());
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USER_FIELD);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.BOOKING_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Mark a complaint as resolved for a user's booking.
   *
   * @param username the username of the user
   * @param bookingId the booking ID for which the complaint is being resolved
   * @throws UserException if the complaint cannot be marked as resolved
   */
  public void markComplaintAsResolved(String username, int bookingId) throws UserException {
    String markComplaintQuery = "{CALL mark_complaint_as_resolved(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(markComplaintQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_booking_id", bookingId);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USER_FIELD);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.BOOKING_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Delete a complaint for a user's booking.
   *
   * @param username the username of the user
   * @param bookingId the booking ID for which the complaint is being deleted
   * @throws UserException if the complaint cannot be deleted
   */
  public void deleteUserComplaint(String username, int bookingId) throws UserException {
    String deleteComplaintQuery = "{CALL delete_user_complaint(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(deleteComplaintQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_booking_id", bookingId);
      cs.executeUpdate();
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USER_FIELD);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.BOOKING_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Get the latest attended booking for a user at a specific turf.
   *
   * @param username the username of the user
   * @param turfId the ID of the turf
   * @return the latest booking if it exists, null otherwise
   * @throws BookingException if the user or turf does not exist or if input is invalid
   */
  public BookingSummary getLatestUserTurfBooking(String username, int turfId)
      throws BookingException {
    String getLatestBookingQuery = "{CALL get_latest_user_turf_booking(?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getLatestBookingQuery)) {
      cs.setString("p_username", username);
      cs.setInt("p_turf_id", turfId);
      try (ResultSet rs = cs.executeQuery()) {
        if (rs.next()) {
          int bookingId = rs.getInt("booking_id");
          LocalDateTime startTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("start_time_local"));
          LocalDateTime endTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("end_time_local"));
          BigDecimal amount = rs.getBigDecimal("amount");
          String complaintSubject = rs.getString("complaint_subject");
          String complaintDescription = rs.getString("complaint_description");
          Instant complaintFiledAtUtc =
              toInstantOrNull(rs.getTimestamp("complaint_filed_at_utc"));
          Instant complaintResolvedAtUtc =
              toInstantOrNull(rs.getTimestamp("complaint_resolved_at_utc"));
          int resultTurfId = rs.getInt("turf_id");
          String bookingUsername = rs.getString("username");
          String maskedCardNumber = rs.getString("masked_card_number");
          Integer couponId = rs.getObject("coupon_id", Integer.class);
          String turfName = rs.getString("turf_name");

          return new BookingSummary(
              bookingId,
              startTimeLocal,
              endTimeLocal,
              amount,
              complaintSubject,
              complaintDescription,
              complaintFiledAtUtc,
              complaintResolvedAtUtc,
              resultTurfId,
              turfName,
              bookingUsername,
              maskedCardNumber,
              couponId);
        }
      }
      return null;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());
      String errorMessage = e.getMessage();

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new BookingException(e, BookingErrorCode.INVALID_INPUT);
        case RESOURCE_NOT_FOUND:
          if (errorMessage != null && errorMessage.toLowerCase().contains("user")) {
            throw new BookingException(e, BookingErrorCode.USER_NOT_FOUND);
          } else if (errorMessage != null && errorMessage.toLowerCase().contains("turf")) {
            throw new BookingException(e, BookingErrorCode.TURF_NOT_FOUND);
          } else {
            throw new BookingException(e, AppErrorCode.UNKNOWN);
          }
        default:
          throw new BookingException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve all upcoming bookings for a user (bookings with start time later than current UTC time).
   *
   * @param username the username of the user
   * @return the list of upcoming bookings
   */
  public List<BookingSummary> getUserUpcomingBookings(String username) {
    String getUpcomingBookingsQuery = "{CALL get_user_upcoming_booking(?)}";
    List<BookingSummary> bookings = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getUpcomingBookingsQuery)) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int bookingId = rs.getInt("booking_id");
          LocalDateTime startTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("start_time_local"));
          LocalDateTime endTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("end_time_local"));
          BigDecimal amount = rs.getBigDecimal("amount");
          String complaintSubject = rs.getString("complaint_subject");
          String complaintDescription = rs.getString("complaint_description");
          Instant complaintFiledAtUtc = toInstantOrNull(rs.getTimestamp("complaint_filed_at_utc"));
          Instant complaintResolvedAtUtc =
              toInstantOrNull(rs.getTimestamp("complaint_resolved_at_utc"));
          int turfId = rs.getInt("turf_id");
          String turfName = rs.getString("turf_name");
          String bookingUsername = rs.getString("username");
          String maskedCardNumber = rs.getString("masked_card_number");
          Integer couponId = rs.getObject("coupon_id", Integer.class);

          bookings.add(
              new BookingSummary(
                  bookingId,
                  startTimeLocal,
                  endTimeLocal,
                  amount,
                  complaintSubject,
                  complaintDescription,
                  complaintFiledAtUtc,
                  complaintResolvedAtUtc,
                  turfId,
                  turfName,
                  bookingUsername,
                  maskedCardNumber,
                  couponId));
        }
      }
      return bookings;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USERNAME);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Retrieve all previous bookings for a user (bookings with start time less than current UTC time).
   *
   * @param username the username of the user
   * @return the list of previous bookings
   */
  public List<BookingSummary> getUserPreviousBookings(String username) {
    String getPreviousBookingsQuery = "{CALL get_user_previous_booking(?)}";
    List<BookingSummary> bookings = new ArrayList<>();
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(getPreviousBookingsQuery)) {
      cs.setString("p_username", username);
      try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) {
          int bookingId = rs.getInt("booking_id");
          LocalDateTime startTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("start_time_local"));
          LocalDateTime endTimeLocal = toLocalDateTimeOrNull(rs.getTimestamp("end_time_local"));
          BigDecimal amount = rs.getBigDecimal("amount");
          String complaintSubject = rs.getString("complaint_subject");
          String complaintDescription = rs.getString("complaint_description");
          Instant complaintFiledAtUtc = toInstantOrNull(rs.getTimestamp("complaint_filed_at_utc"));
          Instant complaintResolvedAtUtc =
              toInstantOrNull(rs.getTimestamp("complaint_resolved_at_utc"));
          int turfId = rs.getInt("turf_id");
          String turfName = rs.getString("turf_name");
          String bookingUsername = rs.getString("username");
          String maskedCardNumber = rs.getString("masked_card_number");
          Integer couponId = rs.getObject("coupon_id", Integer.class);

          bookings.add(
              new BookingSummary(
                  bookingId,
                  startTimeLocal,
                  endTimeLocal,
                  amount,
                  complaintSubject,
                  complaintDescription,
                  complaintFiledAtUtc,
                  complaintResolvedAtUtc,
                  turfId,
                  turfName,
                  bookingUsername,
                  maskedCardNumber,
                  couponId));
        }
      }
      return bookings;
    } catch (SQLException e) {
      DatabaseExceptionCategory databaseExceptionCategory =
          DatabaseExceptionCategory.fromSQLState(e.getSQLState());

      switch (databaseExceptionCategory) {
        case VALIDATION_ERROR:
          throw new UserException(e, UserErrorCode.INVALID_USERNAME);
        case RESOURCE_NOT_FOUND:
          throw new UserException(e, UserErrorCode.USER_NOT_FOUND);
        default:
          throw new UserException(e, AppErrorCode.UNKNOWN);
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Convert a SQL {@link Timestamp} to an {@link Instant} while preserving null to avoid an {@link
   * IllegalArgumentException}.
   *
   * @param timestamp the SQL timestamp to convert
   * @return the converted instant, or null if the timestamp is null
   */
  private Instant toInstantOrNull(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toInstant();
  }

  /**
   * Convert a SQL {@link Timestamp} to a {@link LocalDateTime} while preserving null to avoid an
   * {@link IllegalArgumentException}.
   *
   * @param timestamp the SQL timestamp to convert
   * @return the converted local datetime, or null if the timestamp is null
   */
  private LocalDateTime toLocalDateTimeOrNull(Timestamp timestamp) {
    return timestamp == null ? null : timestamp.toLocalDateTime();
  }
}
