USE huddleup;

/**
 * Procedure: get_all_turfs
 * ------------------------
 * Retrieve all the turfs in the database.
 *
 *
 * Output Columns
 * --------------
 *   - turf_id - The id (PK) of the turf
 *   - turf_name - The name of the turf
 *   - image_url - The first or default image of the turf
 *   - sport_name - type of sport that can be played on the selected turf
 *   - hourly_rate - the hourly rate for the selected turf
 *   - addr_street_1 - primary street address line of the turf
 *   - addr_street_2 - secondary street address line of the turf
 *   - addr_town - town of the turf
 *   - addr_state - state of the turf
 *   - addr_zip_code - zipcode of the turf
 *   - avg_rating - Derived average rating of the turf
 *   - number_of_ratings - the number of user ratings for the turf
 */
DROP PROCEDURE IF EXISTS get_all_turfs;
DELIMITER $$
CREATE PROCEDURE get_all_turfs() 
BEGIN
    SELECT t.turf_id,
           t.turf_name, 
           img.image_url,
           t.sport_name,
           t.hourly_rate,
           t.addr_street_1,
           t.addr_street_2,
           t.addr_town,
           t.addr_state,
           t.addr_zip_code,
           get_avg_turf_rating(t.turf_id) AS avg_rating,
           get_count_turf_rating(t.turf_id) AS number_of_ratings
    FROM turf AS t
    INNER JOIN turf_image AS img
    ON t.turf_id = img.turf_id
    WHERE img.image_index = 0;
END $$
DELIMITER ;

/**
 * Procedure: get_turf
 * -------------------
 * Retrieve data for a given turf
 *
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - The turf_id of the selected turf
 *
 *
 * Output Columns
 * --------------
 *   - turf_id - id of the selected turf
 *   - turf_name - name of the selected turf
 *   - turf_description - description of the selected turf
 *   - floor_material - floor material of the selected turf
 *   - floor_width - floor width of the selected turf
 *   - floor_length length of the floor of the selected turf
 *   - hourly_rate - the hourly rate for the selected turf
 *   - opens_at_local - the local opening time of the selected turf
 *   - closes_at_local - the local closing time of the selected turf
 *   - iana_timezone - the IANA timezone ID of the select turf
 *   - addr_street_1 - primary street address line of the selected turf
 *   - addr_street_2 - secondary street address line of the selected turf
 *   - addr_town - town of the selected turf
 *   - addr_state - state of the selected turf
 *   - addr_zip_code - zipcode of the selected turf
 *   - sport_name - type of sport that can be played on the selected turf
 *   - avg_rating - the average user rating of the selected turf
 *   - number_of_ratings - the number of user ratings for the turf
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such turf exists
 */
DROP PROCEDURE IF EXISTS get_turf;
DELIMITER $$
CREATE PROCEDURE get_turf(IN p_turf_id INT) 
BEGIN
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN 
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;

    SELECT  t.turf_id,
            t.turf_name,
            t.turf_description,
            t.floor_width,
            t.floor_length,
            t.floor_material,
            t.hourly_rate,
            t.opens_at_local,
            t.closes_at_local,
            t.iana_timezone,
            t.addr_street_1,
            t.addr_street_2,
            t.addr_town,
            t.addr_state,
            t.addr_zip_code,
            t.sport_name,
            get_avg_turf_rating(t.turf_id) AS avg_rating,
            get_count_turf_rating(t.turf_id) AS number_of_ratings
    FROM turf AS t
    WHERE t.turf_id = p_turf_id;
END $$
DELIMITER ;

/**
 * Procedure: get_turf_images
 * --------------------------
 * Gets all the images for a given turf
 *
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - The ID of the turf
 *
 *
 * Output Columns
 * --------------
 *   - image_index - index of a single image of the turf
 *   - image_url - url of the image of the turf
 * 
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such turf exists
 */
DROP PROCEDURE IF EXISTS get_turf_images;
DELIMITER $$
CREATE PROCEDURE get_turf_images(IN p_turf_id INT)
BEGIN
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN 
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;

    SELECT image_index, image_url
    FROM turf_image
    WHERE turf_id = p_turf_id; 
END $$
DELIMITER ;

/**
 * Procedure: get_all_valid_coupons
 * --------------------------------
 * Returns all the coupons that are currently valid.
 *
 *
 * Output Columns
 * --------------
 *   - coupon_id - unique ID for the coupon
 *   - coupon_code - code for the coupon visible to the user
 *   - coupon_description - description of the coupon
 *   - discount_percent - discount percent applied
 */ 
DROP PROCEDURE IF EXISTS get_all_valid_coupons;
DELIMITER $$
CREATE PROCEDURE get_all_valid_coupons()
BEGIN
    SELECT 
        coupon_id,
        coupon_code, 
        coupon_description, 
        discount_percent 
    FROM coupon
    WHERE coupon.coupon_start_date <= UTC_DATE() 
        AND coupon.end_date >= UTC_DATE();
END $$
DELIMITER ;


/**
 * Procedure: get_coupon
 * ---------------------
 * Retrieves details for a single coupon.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_coupon_id - ID of the coupon to retrieve
 *
 *
 * Output Columns
 * --------------
 *   - All columns from the coupon table
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if the coupon ID does not exist.
 */
DROP PROCEDURE IF EXISTS get_coupon;
DELIMITER $$
CREATE PROCEDURE get_coupon(IN p_coupon_id INT)
BEGIN
    IF NOT EXISTS (SELECT coupon_id FROM coupon WHERE coupon_id = p_coupon_id) THEN 
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such coupon exists';
    END IF;

    SELECT
        coupon_id,
        coupon_code,
        coupon_description,
        discount_percent,
        coupon_start_date,
        coupon_end_date,
        min_booking_amt
    FROM coupon
    WHERE coupon_id = p_coupon_id;
END $$
DELIMITER ;

/**
 * Procedure: get_all_user_card_details
 * ------------------------------------
 * Retrieves all saved card details for a given user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - username of the user for the cards
 *
 *
 * Output Columns
 * --------------
 *   - card_id - the ID of the card
 *   - card_number - the card number
 *   - name_on_card - the name on the card
 *   - expiry_date - the card expiry date
 *   - addr_street_1 - the primary street address line of the card's billing address
 *   - addr_street_2 - the secondary street address line of the card's billing address
 *   - addr_town - the city/town of the billing address
 *   - addr_state - the 2-letter state code of the billing address (e.g. 'CA', 'NY')
 *   - addr_zip_code - the 5-digit ZIP code of the billing address
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if username is NULL or empty
 *   - Signals SQLSTATE '45002' if no such user exists
 */
DROP PROCEDURE IF EXISTS get_all_user_card_details;
DELIMITER $$
CREATE PROCEDURE get_all_user_card_details(IN p_username INT)
BEGIN
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN 
        SIGNAL SQLSTATE '45001' 
        SET MESSAGE_TEXT = 'Username cannot be NULL or empty';
    END IF;

    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    SELECT
        card_id,
        card_number,
        name_on_card,
        expiry_date,
        addr_street_1,
        addr_street_2,
        addr_town,
        addr_state,
        addr_zip_code
    FROM card_detail
    WHERE username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: book_turf
 * --------------------
 * Creates a booking for a user for a given turf.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - ID of the turf being booked
 *   - p_username - Username of the user making the booking
 *   - p_start_time_utc - Start time of the booking (UTC)
 *   - p_duration_mins - Duration of the booking in minutes
 *   - p_card_id - Payment card ID
 *   - p_coupon_id - (Optional) coupon applied to the booking
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the username is NULL or empty
 *   - Signals SQLSTATE '45001' if the turf ID is NULL
 *   - Signals SQLSTATE '45001' if the duration is not valid
 *   - Signals SQLSTATE '45001' if the amount does not meet coupon requirements
 *   - Signals SQLSTATE '45002' if no such user, turf, or coupon exists
 *   - Signals SQLSTATE '45003' if there is a conflict with an existing booking
 */
DROP PROCEDURE IF EXISTS book_turf;
DELIMITER $$
CREATE PROCEDURE book_turf(
    IN p_turf_id INT,
    IN p_username VARCHAR(64),
    IN p_start_time_UTC DATETIME,
    IN p_duration_mins INT,
    IN p_card_id INT,
    IN p_coupon_id INT
)
BEGIN
    DECLARE v_hourly_rate DECIMAL(10,2);
    DECLARE v_amount DECIMAL(19,2);
    DECLARE v_discount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_min_booking_amt DECIMAL(10,2);
    DECLARE v_end_time DATETIME;
    DECLARE v_masked_card_num VARCHAR(19);
 
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    IF (p_turf_id IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Turf ID cannot be empty';
    ELSEIF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such turf exists';
    END IF;

    IF (p_coupon_id IS NOT NULL AND NOT EXISTS (SELECT coupon_id FROM coupon WHERE coupon_id = p_coupon_id)) THEN 
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such coupon exists';
    END IF;
 
    -- validate duration
    IF (duration_mins IS NULL OR duration_mins <= 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Duration must be a positive number of minutes';
    END IF;

    -- calculate booking end time from start time and booking duration
    SET v_end_time = DATE_ADD(p_start_time_UTC, INTERVAL p_duration_mins MINUTE);
 
    -- check for conflicting booking
    IF check_conflicting_booking(p_turf_id, p_start_time_utc, p_duration_mins) THEN
        SIGNAL SQLSTATE '45003'
        SET MESSAGE_TEXT = 'Time slot is already booked.';
    END IF;

    -- get the hourly rate
    SELECT t.hourly_rate INTO v_hourly_rate
    FROM turf AS t
    WHERE turf_id = p_turf_id;

    SET v_amount = (p_duration_mins / 60) * v_hourly_rate;

    -- apply coupon if not null
    IF (coupon_id IS NOT NULL) THEN
        SELECT discount_percent, min_booking_amt 
        INTO v_discount, v_min_booking_amt
        FROM coupon 
        WHERE coupon_id = p_coupon_id;
    END IF;

    -- check minimum booking requirement to apply coupon
    IF (v_min_booking_amt IS NOT NULL AND v_amount < v_min_booking_amt) THEN
        SIGNAL SQLSTATE '45001' 
        SET MESSAGE_TEXT = 'Amount needs to meet minimum booking amount to apply the coupon';
    ELSE
        SET v_amount = v_amount - (v_amount * (v_discount / 100));
    END IF;
 
    -- get the masked card number for the card id
    SET v_masked_card_num = get_masked_card_number(p_card_id);
 
    INSERT INTO booking (
        start_time_utc,
        duration_mins,
        amount, 
        turf_id,
        username,
        masked_card_number,
        coupon_id
    ) VALUES (
        p_start_time_utc,
        p_duration_mins,
        v_amount,
        p_turf_id,
        p_username,
        v_masked_card_num,
        p_coupon_id
    );
END $$
DELIMITER ;

/**
 * Procedure: get_all_turf_reviews
 * -------------------------------
 * Get all the reviews for a given turf.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - The id (PK) for which the reviews are fetched
 *
 *
 * Output Columns
 * --------------
 *   - review - the review message left by a user
 *   - rating - the rating between 1 to 5 given by a user
 *   - username - username of the user that left the review
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such turf exists
 */
DROP PROCEDURE IF EXISTS get_all_turf_reviews;
DELIMITER $$
CREATE PROCEDURE get_all_turf_reviews(IN p_turf_id INT)
BEGIN
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;

    SELECT review, rating, username
    FROM review
    WHERE turf_id = p_turf_id;
END $$
DELIMITER ;
