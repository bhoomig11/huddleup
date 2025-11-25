package edu.northeastern.dharrguptab.huddleup.auth.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import java.time.LocalDate;

/**
 * Payload for a sign-up request.
 *
 * @param firstName the first name of the new user (required)
 * @param lastName the last name of the new user (optional)
 * @param username the username of the new user (required)
 * @param email the email of the new user (required)
 * @param password the raw, non-encoded password of the new user (required)
 */
public record UserSignupCredentials(
    String firstName,
    String lastName,
    String username,
    String email,
    String password,
    LocalDate birthDate,
    Address address) {}
