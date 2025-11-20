package edu.northeastern.dharrguptab.huddleup.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.northeastern.dharrguptab.huddleup.user.dto.UserProfile;

@RestController
@RequestMapping("/api/user")
public class UserController {
  private final UserRepository userRepository;

  public UserController(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @GetMapping("/{username}/profile")
  public UserProfile getUserProfile(@PathVariable String username) {
    UserProfile userProfile = userRepository.getUserProfile(username);
    return userProfile;
  }
}
