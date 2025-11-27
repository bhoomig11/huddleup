package edu.northeastern.dharrguptab.huddleup.turf;

import edu.northeastern.dharrguptab.huddleup.auth.exception.UnauthenticatedException;
import edu.northeastern.dharrguptab.huddleup.turf.dto.*;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/** Defines business logic for Turfs in HuddleUp application. */
@Service
public class TurfService {
  private TurfRepository turfRepository;

  /**
   * Construct a new instance of the turf service.
   *
   * @param turfRepository the repository sued to obtain database access to the turfs
   */
  public TurfService(TurfRepository turfRepository) {
    this.turfRepository = turfRepository;
  }

  /**
   * Get the data for a turf.
   *
   * @param turfId the ID of the turf
   * @return the turf's data
   */
  public TurfData getTurfData(int turfId) {
    TurfData turfData = turfRepository.getTurf(turfId);
    return turfData;
  }

  /**
   * Get all turfs.
   *
   * @return list of all turf summaries
   */
  public List<TurfSummary> getAllTurfs() {
    List<TurfSummary> turfSummaries = turfRepository.getAllTurfs();
    return turfSummaries;
  }

  /**
   * Creates a booking for a turf.
   *
   * @param turfId the ID of the turf being booked
   * @param bookingRequest the booking request details
   */
  public void bookTurf(int turfId, TurfBookingRequest bookingRequest) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    turfRepository.bookTurf(
        turfId,
        authenticatedUsername,
        bookingRequest.startTimeUtc(),
        bookingRequest.durationMins(),
        bookingRequest.cardId(),
        bookingRequest.couponId());
  }

  /**
   * Add a review for a turf.
   *
   * @param turfId the ID of the turf being reviewed
   * @param reviewRequest the review details
   */
  public void addReview(int turfId, ReviewRequest reviewRequest) {
    String authenticatedUsername = getAuthenticatedUsername();

    boolean isAuthenticated = authenticatedUsername != null;
    if (!isAuthenticated) {
      throw new UnauthenticatedException();
    }

    turfRepository.addReview(authenticatedUsername, turfId, reviewRequest);
  }

  /** Get all reviews for a turf */
  public List<TurfReview> getTurfReviews(int turfId) {
    List<TurfReview> turfReviews = turfRepository.getAllTurfReviews(turfId);
    return turfReviews;
  }

  /**
   * Retrieve the authenticated username from the security context, if present.
   *
   * @return the authenticated username, or null if the request is unauthenticated
   */
  private String getAuthenticatedUsername() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      return null;
    }
    return extractUsernameFromAuthentication(authentication);
  }

  /**
   * Extract the username from an {@link Authentication} principal by handling both {@link
   * UserDetails}-based and plain-string principals.
   *
   * @param authentication the authentication object containing the principal
   * @return the username resolved from the principal
   */
  private String extractUsernameFromAuthentication(Authentication authentication) {
    Object principal = authentication.getPrincipal();
    if (principal instanceof UserDetails userDetails) {
      return userDetails.getUsername();
    }
    return principal.toString();
  }
}
