package edu.northeastern.dharrguptab.huddleup.user;

import edu.northeastern.dharrguptab.huddleup.user.dto.EmailUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.PasswordUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;
import edu.northeastern.dharrguptab.huddleup.user.dto.UsernameUpdate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
  public void updateEmail(
      @PathVariable String username, @RequestBody EmailUpdate emailUpdate) {
    userService.updateEmail(username, emailUpdate.newEmail());
  }
}
