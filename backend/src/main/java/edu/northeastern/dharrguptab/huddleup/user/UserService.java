package edu.northeastern.dharrguptab.huddleup.user;

import org.springframework.stereotype.Service;

import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;

/** Defines business logic pertaining to HuddleUp application users. */
@Service
public class UserService {
  private final UserRepository userRepository;

  /**
   * Construct a new instance of the user service.
   *
   * @param userRepository the repository used to obtain database access to the users
   */
  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Get the profile information for a user.
   *
   * @param username the username of the user
   * @return the user's profile
   */
  public UserProfile getProfile(String username) {
    return userRepository.getUserProfile(username);
  }

  /**
   * Update the profile information for a user.
   *
   * @param username the username of the user
   * @param userProfileUpdate the modified profile information of the user
   */
  public void updateProfile(String username, UserProfileUpdate userProfileUpdate) {
    userRepository.updateUserProfile(username, userProfileUpdate);
  }

  /**
   * Update the username for a user.
   *
   * @param currentUsername the current username of the user
   * @param newUsername the new username of the user
   */
  public void updateUsername(String currentUsername, String newUsername) {
    userRepository.updateUsername(currentUsername, newUsername);
  }

  /**
   * Update the password for a user.
   *
   * @param username the username of the user
   * @param password the new password for the user
   */
  public void updatePassword(String username, String password) {
    // TODO: Hash the password before storing it in the database
    String passwordHash = password;
    userRepository.updatePassword(username, passwordHash);
  }
}
