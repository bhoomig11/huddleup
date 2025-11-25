package edu.northeastern.dharrguptab.huddleup.auth.config;

import edu.northeastern.dharrguptab.huddleup.auth.jwt.UserJwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
  private final UserJwtFilter userJwtFilter;

  public SecurityConfig(UserJwtFilter userJwtFilter) {
    this.userJwtFilter = userJwtFilter;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/api/user/login",
                        "/api/user/signup",
                        "/api/employee/login",
                        "/api/employee/signup")
                    .permitAll()
                    .requestMatchers("/api/user/**")
                    .hasRole("USER")
                    .requestMatchers("/api/employee/**")
                    .hasRole("EMPLOYEE")
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(userJwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
