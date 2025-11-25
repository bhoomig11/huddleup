package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.auth.dto.AuthResponse;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserLoginCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.dto.UserSignupCredentials;
import edu.northeastern.dharrguptab.huddleup.user.dto.AnnouncementDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.AnnouncementSummary;
import edu.northeastern.dharrguptab.huddleup.user.dto.CardDetail;
import edu.northeastern.dharrguptab.huddleup.user.dto.EmailUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.PasswordUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.UsernameUpdate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
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
  public void updateUsername(
      @PathVariable String username, @RequestBody UsernameUpdate usernameUpdate) {
    userService.updateUsername(username, usernameUpdate.newUsername());
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
  public void addCardDetail(@PathVariable String username, @RequestBody CardDetail cardDetail) {
    userService.addCardDetail(username, cardDetail);
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
}
