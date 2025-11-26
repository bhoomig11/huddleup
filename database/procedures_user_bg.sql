USE huddleup;

/**
 * Procedure: get_all_user_bookings
 * --------------------------------
 * Retrieve all the bookings for a user
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user who made the bookings
 *
 * Output Columns
 * --------------
 *   - booking_id - the ID of the booking
 *   - start_time_utc - the timestamp for when the booking starts
 *   - duration_mins - the duration of the booking in minutes
 *   - amount - the amount paid to confirm the booking
 *   - complaint_subject - the subject of the associated complaint if any
 *   - complaint_description - the description of the associated complaint if any
 *   - complaint_filed_at_utc - the timestamp for when any existing complaint was filed
 *   - complaint_resolved_at_utc - the timestamp for when any existing complaint was resolved
 *   - turf_id - the ID of the turf that was booked
 *   - username - the username of the user who made the booking
 *   - masked_card_number - the masked number of the card used to confirm the booking
 *   - coupon_id - the ID of the coupon applied to the booking if any
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the username given is null or empty
 *   - Signals SQLSTATE '45002' if no such user exists
 */
DROP PROCEDURE IF EXISTS get_all_user_bookings;
DELIMITER $$
CREATE PROCEDURE get_all_user_bookings(IN p_username VARCHAR(64)) 
BEGIN
    IF (p_username IS NULL) THEN 
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Username cannot be NULL';
    END IF;

    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    SELECT
        booking_id,
        start_time_utc,
        duration_mins,
        amount,
        complaint_subject,
        complaint_description,
        complaint_filed_at_utc,
        complaint_resolved_at_utc,
        turf_id,
        username,
        masked_card_number,
        coupon_id
    FROM booking
    WHERE username = p_username;
END $$
DELIMITER ;


/**
 * Procedure: get_user_booking
 * ---------------------------
 * Retrieve a booking for a user.
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_booking_id - the ID of the booking
 *
 * Output Columns
 * --------------
 *   - booking_id - the ID of the booking
 *   - start_time_utc - the timestamp for when the booking starts
 *   - duration_mins - the duration of the booking in minutes
 *   - amount - the amount paid to confirm the booking
 *   - complaint_subject - the subject of the associated complaint if any
 *   - complaint_description - the description of the associated complaint if any
 *   - complaint_filed_at_utc - the timestamp for when any existing complaint was filed
 *   - complaint_resolved_at_utc - the timestamp for when any existing complaint was resolved
 *   - turf_id - the ID of the turf that was booked
 *   - username - the username of the user who made the booking
 *   - masked_card_number - the masked number of the card used to confirm the booking
 *   - coupon_id - the ID of the coupon applied to the booking if any
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if either input parameter is NULL or empty
 *   - Signals SQLSTATE '45002' if the corresponding user or booking does not exist
 */
DROP PROCEDURE IF EXISTS get_user_booking;
DELIMITER $$
CREATE PROCEDURE get_user_booking(IN p_username VARCHAR(64), IN p_booking_id INT)
BEGIN 
    IF (p_username IS NULL) THEN
        SIGNAL SQLSTATE "45001" 
        SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE "45002" 
        SET MESSAGE_TEXT = "No such user exists";
    END IF;

    IF (p_booking_id IS NULL) THEN
        SIGNAL SQLSTATE "45001" 
        SET MESSAGE_TEXT = "Booking ID cannot be empty";
    ELSEIF NOT EXISTS (SELECT booking_id FROM booking WHERE booking_id = p_booking_id) THEN
        SIGNAL SQLSTATE "45002" 
        SET MESSAGE_TEXT = "No such booking exists";
    END IF;

    SELECT 
        booking_id,
        start_time_utc,
        duration_mins,
        amount,
        complaint_subject,
        complaint_description,
        complaint_filed_at_utc,
        complaint_resolved_at_utc,
        turf_id,
        username,
        masked_card_number,
        coupon_id
    FROM booking
    WHERE booking_id = p_booking_id AND username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: add_review
 * ---------------------
 * Add a user review for a booking.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user leaving the review
 *   - p_turf_id - the id of the turf being reviewed
 *   - p_rating - the rating value; expects a number between 1 and 5 (inclusive)
 *   - p_review - the review message left by the user
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the username is NULL or empty
 *   - Signals SQLSTATE '45001' if the turf id is NULL or empty
 *   - Signals SQLSTATE '45001' if the rating is not valid
 *   - Signals SQLSTATE '45002' if the corresponding user or turf does not exist
 *   - Signals SQLSTATE '45003' if the user has never booked and visited the turf before
 *   - Signals SQLSTATE '45003' if the user has already reviewed the turf before
 */
DROP PROCEDURE IF EXISTS add_review;
DELIMITER $$
CREATE PROCEDURE add_review(
    IN p_username VARCHAR(64), 
    IN p_turf_id INT, 
    IN p_rating INT,
    IN p_review VARCHAR(255)
)
BEGIN 
    -- check for username
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    -- check if turf id is valid
    IF (p_turf_id IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Turf ID cannot be empty';
    ELSEIF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such turf exists';
    END IF;

    -- check if rating is NOT NULL and within the range
    IF (p_rating IS NULL OR p_rating < 1 OR p_rating > 5) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;

    -- check if the user has booked and visited that turf before -
    -- only users who have booked the turf before can leave a review
    IF NOT EXISTS (
        SELECT booking_id FROM booking
        WHERE
            username = p_username AND
            turf_id = p_turf_id AND
            start_time_utc < UTC_TIMESTAMP()
    ) THEN
        SIGNAL SQLSTATE '45003' 
        SET MESSAGE_TEXT = 'User must have a previously attended booking with the turf to leave a review';
    END IF;

    -- limit users to at most one review for a turf
    IF EXISTS (SELECT rating FROM review WHERE turf_id = p_turf_id AND username = p_username) THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'User has already reviewed this turf previously'
    END IF;

    -- insert a tuple in the review table
    INSERT INTO review (
        username,
        turf_id,
        rating,
        review
    )
    VALUES (
        p_username,
        p_turf_id,
        p_rating,
        p_review
    );

END $$
DELIMITER ;

/**
 * Procedure: file_complaint
 * -------------------------
 * File a user complaint for an existing booking.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - username of the user filing the complaint
 *   - p_booking_id - booking_id of the associated booking
 *   - p_c_subject - subject or title of the complaint
 *   - p_c_description - textual description of the complaint
 *   - p_filed_date - date when the complaint was filed at
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the username is NULL or empty
 *   - Signals SQLSTATE '45001' if the complaint subject is NULL or empty
 *   - Signals SQLSTATE '45002' if no such user or booking exists
 */
DROP PROCEDURE IF EXISTS file_complaint;
DELIMITER $$
CREATE PROCEDURE file_complaint(
    IN p_username VARCHAR(64),
    IN p_booking_id INT,
    IN p_c_subject VARCHAR(64),
    IN p_c_description VARCHAR(255)
)
BEGIN
    -- check for username
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    -- check for invalid booking id
    IF NOT EXISTS (
        SELECT booking_id 
        FROM booking 
        WHERE booking_id = p_booking_id AND username = p_username
    ) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such booking exists';
    END IF;

    -- check if complaint subject is not null
    IF p_c_subject IS NULL OR CHAR_LENGTH(p_c_subject) = 0 THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Complaint subject cannot be empty';
    END IF;

    -- update the tuple for user's booking with the parameters
    UPDATE booking
    SET complaint_subject = p_c_subject,
        complaint_description = p_c_description,
        complaint_filed_date = UTC_TIMESTAMP()
    WHERE booking_id = p_booking_id;
END $$
DELIMITER ;

/**
 * Procedure: delete_user_complaint
 * ----------------------------------
 * Deletes a complaint filed by a user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_booking_id - the ID of the card to be deleted
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' if no such user or booking found.
 */
DROP PROCEDURE IF EXISTS delete_user_complaint;
DELIMITER $$
CREATE PROCEDURE delete_user_complaint(
    IN p_username VARCHAR(64),
    IN p_booking_id INT
)
BEGIN
     -- check for valid username
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'Invalid username';
    END IF;

    -- check for valid booking
    IF NOT EXISTS (
        SELECT booking_id FROM booking WHERE booking_id = p_booking_id
    ) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'No such booking found for this user';
    END IF;

    UPDATE booking
    SET complaint_subject = NULL,
        complaint_description = NULL,
        complaint_filed_at_utc = NULL
    WHERE booking_id = p_booking_id
        AND username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: delete_user_review
 * ----------------------------------
 * Delete review left by the user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_turf_id - the ID of the turf to be deleted
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' if no such user or turf found.
 */
DROP PROCEDURE IF EXISTS delete_user_review;
DELIMITER $$
CREATE PROCEDURE delete_user_review(
    IN p_username VARCHAR(64),
    IN p_turf_id INT
)
BEGIN
     -- check for valid username
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'Invalid username';
    END IF;

    -- check for valid turf
    IF NOT EXISTS (
        SELECT turf_id FROM turf WHERE turf_id = p_turf_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No such turf found';
    END IF;

    DELETE FROM review
    WHERE turf_id = p_turf_id
        AND username = p_username;
END $$
DELIMITER ;

