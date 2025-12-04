USE huddleup;

/**
 * Function: get_avg_turf_rating
 * -----------------------------
 * Returns the average rating for a given turf.
 *
 *
 * Parameters
 * ----------
 *   - p_turf_id - the turf to to calculate the average rating for
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if no such turf exists
 *
 *
 * Returns
 * -------
 * The average of all the ratings for the given turf
 */
DROP FUNCTION IF EXISTS get_avg_turf_rating;
DELIMITER $$
CREATE FUNCTION get_avg_turf_rating(p_turf_id INT)
RETURNS DECIMAL(2,1) DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE avg_rating DECIMAL(2,1);
 
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN 
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;
 
    SELECT AVG(r.rating) INTO avg_rating
    FROM review AS r
    WHERE r.turf_id = p_turf_id;

    RETURN avg_rating;
END $$
DELIMITER ;

/**
 * Function: get_count_turf_rating
 * -------------------------------
 * Returns the number of ratings for a given turf.
 *
 *
 * Parameters
 * ----------
 *   - p_turf_id - the turf to to calculate the average rating for
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if no such turf exists
 *
 *
 * Returns
 * -------
 * The number of ratings for the given turf
 */
DROP FUNCTION IF EXISTS get_count_turf_rating;
DELIMITER $$
CREATE FUNCTION get_count_turf_rating(p_turf_id INT)
RETURNS INT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE count_rating INT DEFAULT 0;
 
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN 
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;
 
    SELECT COUNT(r.rating) INTO count_rating
    FROM review AS r
    WHERE r.turf_id = p_turf_id;

    RETURN count_rating;
END $$
DELIMITER ;

/**
 * Function: get_masked_card_number
 * --------------------------------
 * Returns the masked card number for a given card.
 *
 *
 * Parameters
 * ----------
 *   - p_card_id - the card id for which masked card number is returned
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the card id is NULL or empty
 *   - Signals SQLSTATE '45002' if no such card exists
 *
 *
 * Returns
 * -------
 * The masked card number as a string
 */
DROP FUNCTION IF EXISTS get_masked_card_number;
DELIMITER $$
CREATE FUNCTION get_masked_card_number(p_card_id INT)
RETURNS VARCHAR(19) DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_org_card_number VARCHAR(19);
    DECLARE v_masked_card_num VARCHAR(19);
    DECLARE v_len_card_num INT;
 
    IF (p_card_id is NULL) THEN
        SIGNAL SQLSTATE '45001' 
        SET MESSAGE_TEXT = 'Card ID cannot be null';
    END IF;

    IF NOT EXISTS (SELECT card_id FROM card_detail WHERE card_id = p_card_id) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such card exists';
    END IF;

    SELECT card_number INTO v_org_card_number
    FROM card_detail
    WHERE card_id = p_card_id;

    SET v_len_card_num = CHAR_LENGTH(v_org_card_number);
    SET v_masked_card_num = SUBSTRING(v_org_card_number FROM v_len_card_num - 3 FOR 4);
    SET v_masked_card_num = LPAD(v_masked_card_num, v_len_card_num, '*');

    RETURN v_masked_card_num;
END$$
DELIMITER ;

/**
 * Function: check_conflicting_booking
 * -----------------------------------
 * Check if booking for a turf at a time is possible
 *
 *
 * Parameters
 * ----------
 *   - p_turf_id - the turf id that needs to be booked
 *   - p_start_time_utc - start time of the new booking
 *   - p_end_time_utc - end time of the new booking
 *
 *
 * Returns
 * -------
 * TRUE if there is conflict in booking, FALSE otherwise.
 */
DROP FUNCTION IF EXISTS check_conflicting_booking;
DELIMITER $$
CREATE FUNCTION check_conflicting_booking(
    p_turf_id INT,
    p_start_time_utc DATETIME, 
    p_end_time_utc DATETIME
)
RETURNS BOOLEAN 
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE check_conflict BOOLEAN;

    SET check_conflict = EXISTS(
        SELECT *
        FROM booking
        WHERE
            turf_id = p_turf_id
            AND (
                -- New booking starts within an existing booking
                (p_start_time_utc >= start_time_utc AND p_start_time_utc < end_time_utc)
                OR
                -- New booking ends within an existing booking
                (p_end_time_utc > start_time_utc AND p_end_time_utc <= end_time_utc)
                OR
                -- New booking completely contains an existing booking
                (p_start_time_utc <= start_time_utc AND p_end_time_utc >= end_time_utc)
            )
    );

    RETURN check_conflict;
END $$
DELIMITER ;

/**
 * Function: convert_local_to_utc
 * -------------------------------
 * Converts a local date and time to UTC datetime using the provided timezone.
 *
 * Parameters
 * ----------
 *   - p_date - the date in local timezone (DATE format: YYYY-MM-DD)
 *   - p_time - the time in local timezone (TIME format: HH:mm:ss)
 *   - p_timezone - the IANA timezone identifier (e.g., 'America/New_York')
 *
 * Returns
 * -------
 * The datetime in UTC (DATETIME format)
 */
DROP FUNCTION IF EXISTS convert_local_to_utc;
DELIMITER $$
CREATE FUNCTION convert_local_to_utc(
    p_date DATE,
    p_time TIME,
    p_timezone VARCHAR(64)
)
RETURNS DATETIME
DETERMINISTIC
NO SQL
BEGIN
    RETURN CONVERT_TZ(
        CONCAT(p_date, ' ', p_time),
        p_timezone,
        'UTC'
    );
END $$
DELIMITER ;

