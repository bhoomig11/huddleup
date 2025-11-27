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

    SET v_len_card_num = CHAR_LENGTH(org_card_number);
    SET v_masked_card_num = SUBSTRING(v_org_card_number, v_len_card_num - 4);
    SET v_masked_card_num = LPAD(v_masked_card_num, v_len_card_num, 'X');

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
 *   - p_duration_min - duration of the new booking
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
    p_duration_min INT
)
RETURNS BOOLEAN 
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_end_time DATETIME;
    DECLARE check_conflict BOOLEAN;
 
    SET v_end_time = DATE_ADD(p_start_time_utc, INTERVAL p_duration_min MINUTE);

    SET check_conflict = EXISTS(
        SELECT *
        FROM booking
        WHERE
            turf_id = p_turf_id
            AND (
                (
                    p_start_time_utc BETWEEN start_time_utc
                    AND DATE_ADD(start_time_utc, INTERVAL duration_mins MINUTE)
                )
                OR (
                    v_end_time BETWEEN start_time_utc
                    AND DATE_ADD(start_time_utc, INTERVAL duration_mins MINUTE)
                )
                OR (
                    p_start_time_utc <= start_time_utc
                    AND v_end_time >= DATE_ADD(start_time_utc, INTERVAL duration_mins MINUTE)
                )
            )
    );

    RETURN check_conflict;
END $$
DELIMITER ;

