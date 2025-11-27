package edu.northeastern.dharrguptab.huddleup.turf.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;
import java.sql.Time;

/** Represents a turf's information. */
public record TurfData(
    int turfId,
    String turfName,
    String turfDescription,
    float floorWidth,
    float floorLength,
    String floorMaterial,
    float hourlyRate,
    Time opensAtDate,
    Time closesAtDate,
    Address address,
    float averageRating) {}
