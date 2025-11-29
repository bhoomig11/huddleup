package edu.northeastern.dharrguptab.huddleup.turf.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import java.math.BigDecimal;

/** Represents a turf's information summary. */
public record TurfSummary(
    int turfId,
    String turfName,
    String imageUrl,
    String sportName,
    BigDecimal hourlyRate,
    BigDecimal averageRating,
    int numberOfRatings,
    Address address) {}
