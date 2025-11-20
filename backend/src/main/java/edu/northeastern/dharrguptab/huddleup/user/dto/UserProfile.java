package edu.northeastern.dharrguptab.huddleup.user.dto;

import java.time.LocalDate;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;

/**
 * Represents a user's profile information.
 *
 * @param username the username of the user
 * @param firstName the first name of the user
 * @param lastName the last name of the user
 * @param email the email address of the user
 * @param birthDate the birthdate of the user
 * @param address the address of the user
 */
public record UserProfile(
    String username,
    String firstName,
    String lastName,
    String email,
    LocalDate birthDate,
    Address address
) {}
