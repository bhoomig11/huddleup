package edu.northeastern.dharrguptab.huddleup.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;
import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfileUpdate;

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
  public void updateUserProfile(@PathVariable String username, @RequestBody UserProfileUpdate userProfileUpdate) {
    userService.updateProfile(username, userProfileUpdate);
  }
}
