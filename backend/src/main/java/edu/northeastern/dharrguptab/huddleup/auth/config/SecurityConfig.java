package edu.northeastern.dharrguptab.huddleup.auth.config;

import edu.northeastern.dharrguptab.huddleup.auth.jwt.UserJwtFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
  private final UserJwtFilter userJwtFilter;
  private final AuthEntryPoint authEntryPoint;

  public SecurityConfig(UserJwtFilter userJwtFilter, AuthEntryPoint authEntryPoint) {
    this.userJwtFilter = userJwtFilter;
    this.authEntryPoint = authEntryPoint;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(
                        "/api/user/login",
                        "/api/user/signup",
                        "/api/employee/login",
                        "/api/employee/signup")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/turf/**")
                    .permitAll()
                    .requestMatchers("/api/user/**")
                    .hasRole("USER")
                    .requestMatchers("/api/employee/**")
                    .hasRole("EMPLOYEE")
                    .anyRequest()
                    .authenticated())
        .addFilterBefore(userJwtFilter, UsernamePasswordAuthenticationFilter.class)
        .exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint));

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("*"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
  }
}
