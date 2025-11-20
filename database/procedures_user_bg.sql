USE huddleup;

/**
 * Procedure: get_all_turfs
 * ---------------------------------
 * Retrieve all the bookings for a user
 *
 * Input Parameters
 * ----------------
 *   - p_username - The username for whom the bookings are fetched
 *
 * Output Columns
 * --------------
 * all the columns in booking for a given user
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' for any invalid input parameter
 */
DROP PROCEDURE IF EXISTS get_all_user_booking;
DELIMITER $$
CREATE PROCEDURE get_all_user_booking(IN p_username VARCHAR(64)) 
BEGIN
    IF (p_username IS NULL) THEN 
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username cannot be NULL';
    END IF;

    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid username';
    END IF;

    SELECT *
    FROM booking AS b
    WHERE b.username = p_username;
END $$
DELIMITER ;


/**
 * Procedure: select_booking
 * ---------------------------------
 * Procedure to select a booking
 *
 * Input Parameters
 * ----------------
 *   - p_username - user's username
 *   - p_booking_id - booking id 
 *
 * Output Columns
 * --------------
 *   - all columns in the booking table
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' for any invalid input parameter
 */
DROP PROCEDURE IF EXISTS select_booking;
DELIMITER $$
CREATE PROCEDURE select_booking(IN p_username VARCHAR(64), IN p_booking_id INT)
BEGIN 
    IF (p_username IS NULL) THEN
        SIGNAL SQLSTATE "45000" 
        SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS ( SELECT username FROM app_user 
                        WHERE username = p_username) THEN
        SIGNAL SQLSTATE "45000" 
        SET MESSAGE_TEXT = "Invalid username";
    END IF;

    IF (p_booking_id IS NULL) THEN
        SIGNAL SQLSTATE "45000" 
        SET MESSAGE_TEXT = "Booking ID cannot be empty";
    ELSEIF NOT EXISTS ( SELECT booking_id FROM booking 
                        WHERE booking_id = p_booking_id) THEN
        SIGNAL SQLSTATE "45000" 
        SET MESSAGE_TEXT = "Invalid booking ID";
    END IF;

    SELECT * 
    FROM booking
    WHERE booking.booking_id = p_booking_id
          AND booking.username =  p_username;
END $$
DELIMITER ;

/**
 * Procedure: leave_a_review
 * ---------------------------------
 * Procedure to leave a review
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - username of the user leaving a review
 *   - p_turf_id - id of the turf for which the review is left
 *   - p_rating - rating from 1 to 5 left for the turf
 *   - p_review - review left for the turf
 *
 * Output Columns
 * --------------
 *   username
 *   turf_id
 *   rating
 *   review
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' for any invalid input parameter
 */
DROP PROCEDURE IF EXISTS leave_a_review;
DELIMITER $$
CREATE PROCEDURE leave_review(  IN p_username VARCHAR(64), 
                                IN p_turf_id INT, 
                                IN p_rating INT,
                                IN p_review VARCHAR(255)
                             )
BEGIN 
    -- check for username
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username';
    END IF;

    -- check if turf id is valid
    IF (p_turf_id IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Turf ID cannot be empty';
    ELSEIF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid turf ID';
    END IF;

    -- check if rating is NOT NULL and within the range
    IF (p_rating IS NULL OR p_rating < 1 OR p_rating > 5) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;

    -- check if the user has booked that turf before - 
    -- only users who have booked the turf before can leave a review
    IF NOT EXISTS (SELECT booking_id FROM booking
                    WHERE username = p_username
                    AND turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'User must have booked this turf before leaving a review';
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
 * ---------------------------------
 * Procedure for user to file a complaint
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - username of the user filing the complaint
 *   - p_booking_id - booking_id of the booking for which the complaint will be filed
 *   - p_c_subject - subject or title of the complaint
 *   - p_c_description - textual description of the complaint
 *   - p_filed_date - date when the complaint was filed at
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' for any invalid input parameter
 */
DROP PROCEDURE IF EXISTS file_complaint;
DELIMITER $$
CREATE PROCEDURE file_complaint(IN p_username VARCHAR(64),
                                IN p_booking_id INT,
                                IN p_c_subject VARCHAR(64),
                                IN p_c_description VARCHAR(255)
                                ) 
BEGIN
    -- check for username
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username';
    END IF;

    -- check for invalid booking id
    IF NOT EXISTS (
        SELECT booking_id 
        FROM booking 
        WHERE booking_id = p_booking_id 
          AND username = p_username
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid booking for this user';
    END IF;

    -- check if complaint subject is not null
    IF p_c_subject IS NULL OR CHAR_LENGTH(p_c_subject) = 0 THEN
        SIGNAL SQLSTATE '45000'
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
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username';
    END IF;

    -- check for valid booking
    IF NOT EXISTS (
        SELECT booking_id FROM boooking WHERE booking_id = p_booking_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No such booking found for this user';
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
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid username';
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