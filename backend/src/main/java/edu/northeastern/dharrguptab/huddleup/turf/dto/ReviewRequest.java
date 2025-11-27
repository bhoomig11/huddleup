package edu.northeastern.dharrguptab.huddleup.turf.dto;

/**
 * Payload for adding a review for a turf.
 *
 * @param rating the rating value; expects a number between 1 and 5 (inclusive)
 * @param review the review message left by the user
 */
public record ReviewRequest(int rating, String review) {}

