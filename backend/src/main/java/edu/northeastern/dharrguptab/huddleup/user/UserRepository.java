package edu.northeastern.dharrguptab.huddleup.user;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;

import javax.sql.DataSource;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;

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
   * Retrieve the profile details for a given user.
   *
   * @param username the username of the user
   * @return the user's profile data
   */
  public UserProfile getUserProfile(String username) {
    try (
        Connection connection = dataSource.getConnection();
        CallableStatement cs = connection.prepareCall("{CALL get_user_profile(?)}")
    ) {
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
      System.err.println(e.getMessage());
    }
    return null;
  }
}
