package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.auth.dto.UserCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.exception.InvalidCredentialsException;
import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.AppErrorCode;
import edu.northeastern.dharrguptab.huddleup.common.exceptions.DatabaseExceptionCategory;
import edu.northeastern.dharrguptab.huddleup.user.dto.CardDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;
import edu.northeastern.dharrguptab.huddleup.user.exceptions.UserErrorCode;
import edu.northeastern.dharrguptab.huddleup.user.exceptions.UserException;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
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
      cs.execute();
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
      cs.setString("p_addr_street_1", userProfileUpdate.address().streetLine1());
      cs.setString("p_addr_street_2", userProfileUpdate.address().streetLine2());
      cs.setString("p_addr_town", userProfileUpdate.address().town());
      cs.setString("p_addr_state", userProfileUpdate.address().state());
      cs.setString("p_addr_zip_code", userProfileUpdate.address().zipcode());
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
   * @param cardDetail the card detail information to add
   * @throws UserException if no such user exists or if the card details are invalid
   */
  public void addCardDetail(String username, CardDetail cardDetail) throws UserException {
    String addCardDetailQuery = "{CALL add_user_card_detail(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}";
    try (Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall(addCardDetailQuery)) {
      Address billingAddress = cardDetail.billingAddress();

      cs.setString("p_username", username);
      cs.setString("p_card_number", cardDetail.cardNumber());
      cs.setString("p_name_on_card", cardDetail.nameOnCard());
      cs.setString("p_expiry_month", cardDetail.expiryMonth());
      cs.setString("p_expiry_year", cardDetail.expiryYear());
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
}
