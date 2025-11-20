package edu.northeastern.dharrguptab.huddleup.common.dto;

/**
 * Represents details of an address.
 *
 * @param streetLine1 the primary street address line
 * @param streetLine2 the secondary street address line (e.g. apartment or suite number)
 * @param town the city/town of the address
 * @param state the 2-letter state code of the address
 * @param zipcode the 5-digit ZIP code of the address
 */
public record Address(
    String streetLine1,
    String streetLine2,
    String town,
    String state,
    String zipcode
) {}
