package edu.northeastern.dharrguptab.huddleup.auth.service;

import edu.northeastern.dharrguptab.huddleup.auth.dto.UserCredentials;
import edu.northeastern.dharrguptab.huddleup.auth.exception.InvalidCredentialsException;
import edu.northeastern.dharrguptab.huddleup.user.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserService implements UserDetailsService {
  private final UserRepository userRepository;

  /**
   * Create a new service to access application users.
   *
   * @param userRepository the repository that provides database access to user's login details in
   *     app_user entity
   */
  public AppUserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    UserCredentials userCredentials = userRepository.getLoginUser(username);
    if (userCredentials == null) {
      throw new InvalidCredentialsException();
    }
    return buildUserDetails(userCredentials);
  }

  private UserDetails buildUserDetails(UserCredentials userCredentials) {
    return User.builder()
        .username(userCredentials.username())
        .password(userCredentials.passwordHash())
        .roles("USER")
        .build();
  }
}
