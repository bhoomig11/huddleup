package edu.northeastern.dharrguptab.huddleup.turf;

import edu.northeastern.dharrguptab.huddleup.turf.dto.ReviewRequest;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfBookingRequest;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfData;
import edu.northeastern.dharrguptab.huddleup.turf.dto.TurfSummary;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
   */
  @PostMapping("/{turf_id}/book")
  public void bookTurf(@PathVariable int turf_id, @RequestBody TurfBookingRequest bookingRequest) {
    turfService.bookTurf(turf_id, bookingRequest);
  }

  /**
   * Endpoint for adding a review for a turf.
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
  public List<ReviewRequest> getTurfReviews(@PathVariable int turf_id) {
    return getTurfReviews(turf_id);
  }
}
