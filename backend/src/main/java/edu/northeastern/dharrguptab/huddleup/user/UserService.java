package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.auth.dto.UserCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserLoginCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserSignupCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.exception.InvalidCredentialsException;
import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthenticatedException;
import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthorizedException;
import edu.northeastern.dharrguptab.huddleup.auth.jwt.JwtService;
import edu.northeastern.dharrguptab.huddleup.user.dto.CardDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/** Defines business logic pertaining to HuddleUp application users. */
@Service
public class UserService {
  private final UserRepository userRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;

  /**
   * Construct a new instance of the user service.
   *
   * @param userRepository the repository used to obtain database access to the users
   */
  public UserService(
      UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
  }

  public String loginUser(UserLoginCredentials userLoginCredentials) {
    UserCredentials userActualCredentials =
        userRepository.getLoginUser(userLoginCredentials.username());
    if (userActualCredentials == null) {
      throw new InvalidCredentialsException();
    }

    boolean isPasswordCorrect =
        passwordEncoder.matches(
            userLoginCredentials.password(), userActualCredentials.passwordHash());
    if (!isPasswordCorrect) {
      throw new InvalidCredentialsException();
    }

    String token = jwtService.generateToken(userActualCredentials.username());
    return token;
  }

  public String signupUser(UserSignupCredentials userSignupCredentials) {
    String hashedPassword = passwordEncoder.encode(userSignupCredentials.password());
    userRepository.createNewUser(
        userSignupCredentials.username(),
        hashedPassword,
        userSignupCredentials.firstName(),
        userSignupCredentials.lastName(),
        userSignupCredentials.email(),
        userSignupCredentials.birthDate(),
        userSignupCredentials.address());
    String token = jwtService.generateToken(userSignupCredentials.username());
    return token;
  }

  /**
   * Get the profile information for a user.
   *
   * @param username the username of the user
   * @return the user's profile
   */
  public UserProfile getProfile(String username) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new UnauthenticatedException();
    }
    Object principal = authentication.getPrincipal();
    String authenticatedUsername =
        (principal instanceof UserDetails ud) ? ud.getUsername() : principal.toString();

    if (!username.equals(authenticatedUsername)) {
      throw new UnauthorizedException();
    }
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
    String passwordHash = passwordEncoder.encode(password);
    userRepository.updatePassword(username, passwordHash);
  }

  /**
   * Update the email address for a user.
   *
   * @param username the username of the user
   * @param newEmail the new email address of the user
   */
  public void updateEmail(String username, String newEmail) {
    userRepository.updateEmail(username, newEmail);
  }

  /**
   * Delete a user from the database.
   *
   * @param username the username of the user to delete
   */
  public void deleteUser(String username) {
    userRepository.deleteUser(username);
  }

  /**
   * Add a new card detail for a user.
   *
   * @param username the username of the user
   * @param cardDetail the card detail information to add
   */
  public void addCardDetail(String username, CardDetail cardDetail) {
    userRepository.addCardDetail(username, cardDetail);
  }

  /**
   * Delete a card detail for a user.
   *
   * @param username the username of the user
   * @param cardId the ID of the card to delete
   */
  public void deleteCardDetail(String username, int cardId) {
    userRepository.deleteCardDetail(username, cardId);
  }
}
