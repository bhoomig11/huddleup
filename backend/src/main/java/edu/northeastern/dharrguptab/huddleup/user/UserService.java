package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.auth.dto.AuthResponse;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserLoginCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserSignupCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.exception.InvalidCredentialsException;
import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthenticatedException;
import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthorizedException;
import edu.northeastern.dharrguptab.huddleup.auth.jwt.JwtService;
import edu.northeastern.dharrguptab.huddleup.user.dto.*;
import java.util.List;
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
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
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
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.updateUserProfile(username, userProfileUpdate);
  }

  /**
   * Update the username for a user.
   *
   * @param currentUsername the current username of the user
   * @param newUsername the new username of the user
   */
  public AuthResponse updateUsername(String currentUsername, String newUsername) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = currentUsername.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.updateUsername(currentUsername, newUsername);
    String token = jwtService.generateToken(newUsername);
    return new AuthResponse(token);
  }

  /**
   * Update the password for a user.
   *
   * @param username the username of the user
   * @param password the new password for the user
   */
  public void updatePassword(String username, String password) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

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
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.updateEmail(username, newEmail);
  }

  /**
   * Delete a user from the database.
   *
   * @param username the username of the user to delete
   */
  public void deleteUser(String username) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.deleteUser(username);
  }

  /**
   * Add a new card detail for a user.
   *
   * @param username the username of the user
   * @param newCardDetail the card detail information to add
   */
  public void addCardDetail(String username, NewCardDetail newCardDetail) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.addCardDetail(username, newCardDetail);
  }

  public List<CardDetail> getAllCardDetails(String username) {
    String authenticatedUsername = getAuthenticatedUsername();
    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }
    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getAllCardDetails(username);
  }

  /**
   * Delete a card detail for a user.
   *
   * @param username the username of the user
   * @param cardId the ID of the card to delete
   */
  public void deleteCardDetail(String username, int cardId) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.deleteCardDetail(username, cardId);
  }

  /**
   * Retrieve all announcements for a user.
   *
   * @param username the username of the user
   * @return the list of announcement summaries
   */
  public List<AnnouncementSummary> getAnnouncements(String username) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getAllAnnouncements(username);
  }

  /**
   * Retrieve a specific announcement for a user.
   *
   * @param username the username of the user
   * @param announcementId the announcement ID
   * @return the detailed announcement
   */
  public AnnouncementDetail getAnnouncement(String username, int announcementId) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getAnnouncement(username, announcementId);
  }

  /**
   * Mark a single announcement as read for a user.
   *
   * @param username the username of the user
   * @param announcementId the announcement ID
   */
  public void markAnnouncementAsRead(String username, int announcementId) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.markAnnouncementAsRead(username, announcementId);
  }

  /**
   * Mark all announcements as read for a user.
   *
   * @param username the username of the user
   */
  public void markAllAnnouncementsAsRead(String username) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.markAllAnnouncementsAsRead(username);
  }

  /**
   * Retrieve all bookings for a user.
   *
   * @param username the username of the user
   * @return the list of booking summaries
   */
  public List<BookingSummary> getAllUserBookings(String username) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getAllUserBookings(username);
  }

  /**
   * Retrieve all upcoming bookings for a user (bookings with start time later than current UTC time).
   *
   * @param username the username of the user
   * @return the list of upcoming booking summaries
   */
  public List<BookingSummary> getUserUpcomingBookings(String username) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getUserUpcomingBookings(username);
  }

  /**
   * Retrieve all previous bookings for a user (bookings with start time less than current UTC time).
   *
   * @param username the username of the user
   * @return the list of previous booking summaries
   */
  public List<BookingSummary> getUserPreviousBookings(String username) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getUserPreviousBookings(username);
  }

  /**
   * Retrieve a specific booking for a user.
   *
   * @param username the username of the user
   * @param bookingId the booking ID
   * @return the booking detail
   */
  public BookingSummary getUserBooking(String username, int bookingId) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getUserBooking(username, bookingId);
  }

  /**
   * File a complaint for a user's booking.
   *
   * @param username the username of the user
   * @param bookingId the booking ID for which the complaint is being filed
   * @param complaintRequest the complaint details
   */
  public void fileComplaint(String username, int bookingId, ComplaintRequest complaintRequest) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.fileComplaint(username, bookingId, complaintRequest);
  }

  /**
   * Mark a complaint as resolved for a user's booking.
   *
   * @param username the username of the user
   * @param bookingId the booking ID for which the complaint is being resolved
   */
  public void markComplaintAsResolved(String username, int bookingId) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    userRepository.markComplaintAsResolved(username, bookingId);
  }

  /**
   * Get the latest attended booking for a user at a specific turf.
   *
   * @param username the username of the user
   * @param turfId the ID of the turf
   * @return the latest booking if it exists, null otherwise
   */
  public BookingSummary getLatestUserTurfBooking(String username, int turfId) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    boolean isAuthorized = username.equals(authenticatedUsername);
    if (!isAuthorized) {
      throw new UnauthorizedException();
    }

    return userRepository.getLatestUserTurfBooking(username, turfId);
  }

  /**
   * Retrieve the authenticated username from the security context, if present.
   *
   * @return the authenticated username, or null if the request is unauthenticated
   */
  private String getAuthenticatedUsername() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      return null;
    }
    return extractUsernameFromAuthentication(authentication);
  }

  /**
   * Extract the username from an {@link Authentication} principal by handling both {@link
   * UserDetails}-based and plain-string principals.
   *
   * @param authentication the authentication object containing the principal
   * @return the username resolved from the principal
   */
  private String extractUsernameFromAuthentication(Authentication authentication) {
    Object principal = authentication.getPrincipal();
    if (principal instanceof UserDetails userDetails) {
      return userDetails.getUsername();
    }
    return principal.toString();
  }
}
