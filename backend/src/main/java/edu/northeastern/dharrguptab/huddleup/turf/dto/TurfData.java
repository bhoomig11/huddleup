package edu.northeastern.dharrguptab.huddleup.turf.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import java.math.BigDecimal;
import java.sql.Time;

/** Represents a turf's information. */
public record TurfData(
    int turfId,
    String turfName,
    String turfDescription,
    String sportName,
    BigDecimal floorWidth,
    BigDecimal floorLength,
    String floorMaterial,
    BigDecimal hourlyRate,
    BigDecimal averageRating,
    int numberOfRatings,
    Time opensAtLocalTime,
    Time closesAtLocalTime,
    String ianaTimezone,
    Address address) {}
