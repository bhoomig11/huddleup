package edu.northeastern.dharrguptab.huddleup.turf;

import edu.northeastern.dharrguptab.huddleup.turf.dto.BookingResponse;
import edu.northeastern.dharrguptab.huddleup.turf.dto.ReviewRequest;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfBookingRequest;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfData;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfFeature;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfReview;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfSummary;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/turf")
public class TurfController {
  private final TurfService turfService;

  public TurfController(TurfService turfService) {
    this.turfService = turfService;
  }

  /** Endpoint for getting all turfs. */
  @GetMapping
  public List<TurfSummary> getAllTurfs() {
    return turfService.getAllTurfs();
  }

  /** Endpoint for getting a turf. */
  @GetMapping("/{turf_id}")
  public TurfData getTurfData(@PathVariable int turf_id) {
    TurfData turfData = turfService.getTurfData(turf_id);
    return turfData;
  }

  /**
   * Endpoint for booking a turf.
   *
   * @param turf_id the ID of the turf to book
   * @param bookingRequest the booking request details
   * @return the booking response containing the booking ID
   */
  @PostMapping("/{turf_id}/book")
  public BookingResponse bookTurf(
      @PathVariable int turf_id, @RequestBody TurfBookingRequest bookingRequest) {
    int bookingId = turfService.bookTurf(turf_id, bookingRequest);
    return new BookingResponse(bookingId);
  }

  /**
   * Endpoint for adding a review for a turf by the authenticated user.
   *
   * @param turf_id the ID of the turf being reviewed
   * @param reviewRequest the review details
   */
  @PostMapping("/{turf_id}/review")
  public void addReview(@PathVariable int turf_id, @RequestBody ReviewRequest reviewRequest) {
    turfService.addReview(turf_id, reviewRequest);
  }

  /** Endpoint for getting all the reviews for a turf */
  @GetMapping("/{turf_id}/review")
  public List<TurfReview> getTurfReviews(@PathVariable int turf_id) {
    return turfService.getTurfReviews(turf_id);
  }

  /**
   * Endpoint for deleting the authenticated user's review for a turf.
   *
   * @param turf_id the ID of the turf
   */
  @DeleteMapping("/{turf_id}/review")
  public void deleteReview(@PathVariable int turf_id) {
    turfService.deleteReview(turf_id);
  }

  /**
   * Endpoint for updating the authenticated user's review for a turf.
   *
   * @param turf_id the ID of the turf being reviewed
   * @param reviewRequest the review details
   */
  @PutMapping("/{turf_id}/review")
  public void updateReview(@PathVariable int turf_id, @RequestBody ReviewRequest reviewRequest) {
    turfService.updateReview(turf_id, reviewRequest);
  }

  /** Endpoint for getting all the images for a turf */
  @GetMapping("/{turf_id}/image")
  public List<String> getTurfImages(@PathVariable int turf_id) {
    return turfService.getTurfImages(turf_id);
  }

  /** Endpoint for getting all the features for a turf */
  @GetMapping("/{turf_id}/feature")
  public List<TurfFeature> getTurfFeatures(@PathVariable int turf_id) {
    return turfService.getTurfFeatures(turf_id);
  }

  /**
   * Endpoint for getting available start times for a turf on a given date.
   *
   * @param turf_id the ID of the turf
   * @param date the date to check availability for (YYYY-MM-DD format)
   * @return list of available start times as strings (HH:mm:ss format)
   */
  @GetMapping("/{turf_id}/available-start-times")
  public List<String> getAvailableStartTimes(
      @PathVariable int turf_id,
      @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate date) {
    return turfService.getAvailableStartTimes(turf_id, date);
  }

  /**
   * Endpoint for getting available end times for a turf on a given date and start time.
   *
   * @param turf_id the ID of the turf
   * @param date the date to check availability for (YYYY-MM-DD format)
   * @param startTime the selected start time (HH:mm:ss format)
   * @return list of available end times as strings (HH:mm:ss format)
   */
  @GetMapping("/{turf_id}/available-end-times")
  public List<String> getAvailableEndTimes(
      @PathVariable int turf_id,
      @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate date,
      @RequestParam String startTime) {
    return turfService.getAvailableEndTimes(turf_id, date, startTime);
  }
}
