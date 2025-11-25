package edu.northeastern.dharrguptab.huddleup.user.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import java.time.LocalDate;

/**
 * Represents the fields of a user's profile to update.
 *
 * @param firstName the first name of the user
 * @param lastName the last name of the user
 * @param birthDate the birthdate of the user
 * @param address the address of the user
 */
public record UserProfileUpdate(
    String firstName,
    String lastName,
    LocalDate birthDate,
    Address address
) {}
