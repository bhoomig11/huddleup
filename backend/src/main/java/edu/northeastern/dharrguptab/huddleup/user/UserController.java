package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.auth.dto.AuthResponse;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserLoginCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserSignupCredentials;
import edu.northeastern.dharrguptab.huddleup.user.dto.AnnouncementDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.AnnouncementSummary;
import edu.northeastern.dharrguptab.huddleup.user.dto.BookingSummary;
import edu.northeastern.dharrguptab.huddleup.user.dto.CardDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.ComplaintRequest;
import edu.northeastern.dharrguptab.huddleup.user.dto.EmailUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.NewCardDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.PasswordUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.UsernameUpdate;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  /**
   * Endpoint for user login
   *
   * @param request the user login and password passed in
   * @return the generated JWT token
   */
  @PostMapping("/login")
  public AuthResponse login(@RequestBody UserLoginCredentials request) {
    String token = userService.loginUser(request);
    return new AuthResponse(token);
  }

  /**
   * Endpoint to create a new user signup to HuddleUp
   *
   * @param request the signup request payload
   * @return 201 CREATED if success, 400 BAD_REQUEST if failure
   */
  @PostMapping("/signup")
  public AuthResponse signup(@RequestBody UserSignupCredentials request) {
    String token = userService.signupUser(request);
    return new AuthResponse(token);
  }

  @GetMapping("/{username}/profile")
  public UserProfile getUserProfile(@PathVariable String username) {
    UserProfile userProfile = userService.getProfile(username);
    return userProfile;
  }

  @PutMapping("/{username}/profile")
  public void updateUserProfile(
      @PathVariable String username, @RequestBody UserProfileUpdate userProfileUpdate) {
    userService.updateProfile(username, userProfileUpdate);
  }

  @PutMapping("/{username}/username")
  public AuthResponse updateUsername(
      @PathVariable String username, @RequestBody UsernameUpdate usernameUpdate) {
    return userService.updateUsername(username, usernameUpdate.newUsername());
  }

  @PutMapping("/{username}/password")
  public void updatePassword(
      @PathVariable String username, @RequestBody PasswordUpdate passwordUpdate) {
    userService.updatePassword(username, passwordUpdate.password());
  }

  @PutMapping("/{username}/email")
  public void updateEmail(@PathVariable String username, @RequestBody EmailUpdate emailUpdate) {
    userService.updateEmail(username, emailUpdate.newEmail());
  }

  @DeleteMapping("/{username}")
  public void deleteUser(@PathVariable String username) {
    userService.deleteUser(username);
  }

  @PostMapping("/{username}/cards")
  public void addCardDetail(
      @PathVariable String username, @RequestBody NewCardDetail newCardDetail) {
    userService.addCardDetail(username, newCardDetail);
  }

  @GetMapping("/{username}/cards")
  public List<CardDetail> getAllCardDetails(@PathVariable String username) {
    return userService.getAllCardDetails(username);
  }

  @DeleteMapping("/{username}/cards/{cardId}")
  public void deleteCardDetail(@PathVariable String username, @PathVariable int cardId) {
    userService.deleteCardDetail(username, cardId);
  }

  @GetMapping("/{username}/announcements")
  public List<AnnouncementSummary> getAnnouncements(@PathVariable String username) {
    return userService.getAnnouncements(username);
  }

  @GetMapping("/{username}/announcements/{announcementId}")
  public AnnouncementDetail getAnnouncement(
      @PathVariable String username, @PathVariable int announcementId) {
    return userService.getAnnouncement(username, announcementId);
  }

  @PatchMapping("/{username}/announcements/{announcementId}/read")
  public void markAnnouncementAsRead(
      @PathVariable String username, @PathVariable int announcementId) {
    userService.markAnnouncementAsRead(username, announcementId);
  }

  @PatchMapping("/{username}/announcements/read-all")
  public void markAllAnnouncementsAsRead(@PathVariable String username) {
    userService.markAllAnnouncementsAsRead(username);
  }

  @GetMapping("/{username}/booking")
  public List<BookingSummary> getAllUserBookings(@PathVariable String username) {
    return userService.getAllUserBookings(username);
  }

  @GetMapping("/{username}/booking/{booking_id}")
  public BookingSummary getUserBooking(
      @PathVariable String username, @PathVariable int booking_id) {
    return userService.getUserBooking(username, booking_id);
  }

  @PutMapping("/{username}/booking/{booking_id}/complaint")
  public void fileComplaint(
      @PathVariable String username,
      @PathVariable int booking_id,
      @RequestBody ComplaintRequest complaintRequest) {
    userService.fileComplaint(username, booking_id, complaintRequest);
  }

  @PatchMapping("/{username}/booking/{booking_id}/complaint/resolve")
  public void markComplaintAsResolved(@PathVariable String username, @PathVariable int booking_id) {
    userService.markComplaintAsResolved(username, booking_id);
  }

  @DeleteMapping("/{username}/review/{turf_id}")
  public void deleteUserReview(@PathVariable String username, @PathVariable int turf_id) {
    userService.deleteUserReview(username, turf_id);
  }
}
