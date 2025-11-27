package edu.northeastern.dharrguptab.huddleup.turf.dto;

import edu.northeastern.dharrguptab.huddleup.common.dto.Address;

/** Represents a turf's information summary. */
public record TurfSummary(
    int turfId, String turfName, String imageUrl, float averageRating, Address address) {}
