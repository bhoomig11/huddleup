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
 *   - coupon_start_date - start date when the coupon becomes valid
 *   - coupon_end_date - end date when the coupon expires
 *   - min_booking_amt - minimum booking amount required to use this coupon (nullable)
 */ 
DROP PROCEDURE IF EXISTS get_all_valid_coupons;
DELIMITER $$
CREATE PROCEDURE get_all_valid_coupons()
BEGIN
    SELECT 
        coupon_id,
        coupon_code, 
        coupon_description, 
        discount_percent,
        coupon_start_date,
        coupon_end_date,
        min_booking_amt
    FROM coupon
    WHERE coupon.coupon_start_date <= UTC_DATE() 
        AND coupon.coupon_end_date >= UTC_DATE();
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
 *   - card_number - the masked card number (last 4 digits visible)
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
CREATE PROCEDURE get_all_user_card_details(IN p_username VARCHAR(64))
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
        get_masked_card_number(card_id) AS card_number,
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
 *   - p_date - Date of the booking (DATE format: YYYY-MM-DD, local time)
 *   - p_start_time - Start time of the booking (TIME format: HH:mm:ss, local time)
 *   - p_end_time - End time of the booking (TIME format: HH:mm:ss, local time)
 *   - p_card_id - Payment card ID
 *   - p_coupon_id - (Optional) coupon applied to the booking
 *
 *
 * Output Columns
 * --------------
 *   - booking_id - The ID of the newly created booking
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the username is NULL or empty
 *   - Signals SQLSTATE '45001' if the turf ID is NULL
 *   - Signals SQLSTATE '45001' if start/end time validation fails
 *   - Signals SQLSTATE '45001' if the amount does not meet coupon requirements
 *   - Signals SQLSTATE '45002' if no such user, turf, or coupon exists
 *   - Signals SQLSTATE '45003' if there is a conflict with an existing booking
 */
DROP PROCEDURE IF EXISTS book_turf;
DELIMITER $$
CREATE PROCEDURE book_turf(
    IN p_turf_id INT,
    IN p_username VARCHAR(64),
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_card_id INT,
    IN p_coupon_id INT
)
BEGIN
    DECLARE v_hourly_rate DECIMAL(10,2);
    DECLARE v_iana_timezone VARCHAR(64);
    DECLARE v_opens_at_local TIME;
    DECLARE v_closes_at_local TIME;
    DECLARE v_amount DECIMAL(19,2);
    DECLARE v_discount DECIMAL(10,2) DEFAULT 0;
    DECLARE v_min_booking_amt DECIMAL(10,2);
    DECLARE v_masked_card_num VARCHAR(19);
    DECLARE v_start_minute INT;
    DECLARE v_start_second INT;
    DECLARE v_end_minute INT;
    DECLARE v_end_second INT;
    DECLARE v_duration_mins INT;
    DECLARE v_start_time_utc DATETIME;
    DECLARE v_end_time_utc DATETIME;
 
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
 
    -- validate end time is after start time (in local time)
    IF (p_end_time <= p_start_time) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'End time must be after start time';
    END IF;

    -- validate start time is at a multiple of 30 minutes (00 or 30 minutes, 0 seconds)
    SET v_start_minute = MINUTE(p_start_time);
    SET v_start_second = SECOND(p_start_time);
    IF (v_start_minute NOT IN (0, 30) OR v_start_second != 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Start time must be at a multiple of 30 minutes (e.g., 10:00, 10:30)';
    END IF;

    -- validate end time is 1 minute before a multiple of 30 minutes (29 or 59 minutes, 0 seconds)
    SET v_end_minute = MINUTE(p_end_time);
    SET v_end_second = SECOND(p_end_time);
    IF (v_end_minute NOT IN (29, 59) OR v_end_second != 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'End time must be 1 minute before a multiple of 30 minutes (e.g., 10:29, 10:59)';
    END IF;

    -- get the hourly rate, timezone, and operational hours from the turf
    SELECT t.hourly_rate, t.iana_timezone, t.opens_at_local, t.closes_at_local
    INTO v_hourly_rate, v_iana_timezone, v_opens_at_local, v_closes_at_local
    FROM turf AS t
    WHERE turf_id = p_turf_id;

    -- validate that booking time is within operational hours
    IF (p_start_time < v_opens_at_local OR p_end_time > v_closes_at_local) THEN
        SIGNAL SQLSTATE '45001' 
        SET MESSAGE_TEXT = 'Booking time must be within turf operational hours';
    END IF;

    -- convert local times to UTC using the turf's timezone
    SET v_start_time_utc = convert_local_to_utc(p_date, p_start_time, v_iana_timezone);
    SET v_end_time_utc = convert_local_to_utc(p_date, p_end_time, v_iana_timezone);

    -- validate duration: since start is at :00/:30 and end is at :29/:59,
    -- duration should be 29 mod 30 (e.g., 29, 59, 89, 119 minutes)
    SET v_duration_mins = TIMESTAMPDIFF(MINUTE, v_start_time_utc, v_end_time_utc);
    IF (v_duration_mins % 30 != 29) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Duration must be 29 minutes modulo 30 (e.g., 29, 59, 89 minutes)';
    END IF;
 
    -- check for conflicting booking (using start and end time in UTC)
    IF check_conflicting_booking(p_turf_id, v_start_time_utc, v_end_time_utc) THEN
        SIGNAL SQLSTATE '45003'
        SET MESSAGE_TEXT = 'Time slot is already booked.';
    END IF;

    -- calculate amount based on duration in minutes
    SET v_amount = (v_duration_mins / 60) * v_hourly_rate;

    -- apply coupon if not null
    IF (p_coupon_id IS NOT NULL) THEN
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
        end_time_utc,
        amount, 
        turf_id,
        username,
        masked_card_number,
        coupon_id
    ) VALUES (
        v_start_time_utc,
        v_end_time_utc,
        v_amount,
        p_turf_id,
        p_username,
        v_masked_card_num,
        p_coupon_id
    );

    SELECT booking_id
    FROM booking
    WHERE turf_id = p_turf_id
        AND username = p_username
        AND start_time_utc = v_start_time_utc
        AND end_time_utc = v_end_time_utc
        AND amount = v_amount
        AND masked_card_number = v_masked_card_num
        AND ((p_coupon_id IS NULL AND coupon_id IS NULL)
             OR (p_coupon_id IS NOT NULL AND coupon_id = p_coupon_id))
    ORDER BY booking_id DESC
    LIMIT 1;
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

/**
 * Procedure: get_turf_features
 * ----------------------------
 * Get all the features for a given turf.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - The id (PK) for which the features are fetched
 *
 *
 * Output Columns
 * --------------
 *   - feature_name - the name of the feature
 *   - feature_description - the description of the feature
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such turf exists
 */
DROP PROCEDURE IF EXISTS get_turf_features;
DELIMITER $$
CREATE PROCEDURE get_turf_features(IN p_turf_id INT)
BEGIN
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;

    SELECT tf.feat_name AS feature_name, tf.feat_description AS feature_description
    FROM turf_to_feature AS ttf
    INNER JOIN turf_feature AS tf ON ttf.feature_name = tf.feat_name
    WHERE ttf.turf_id = p_turf_id
    ORDER BY tf.feat_name;
END $$
DELIMITER ;

/**
 * Procedure: get_all_features
 * ----------------------------
 * Get all available features in the system.
 *
 *
 * Output Columns
 * --------------
 *   - feature_name - the name of the feature
 *   - feature_description - the description of the feature
 */
DROP PROCEDURE IF EXISTS get_all_features;
DELIMITER $$
CREATE PROCEDURE get_all_features()
BEGIN
    SELECT feat_name AS feature_name, feat_description AS feature_description
    FROM turf_feature
    ORDER BY feat_name;
END $$
DELIMITER ;

/**
 * Procedure: get_available_start_times
 * ------------------------------------
 * Get all available start times (:00, :30) for a turf on a given date.
 * A start time is available if it doesn't fall within an existing booking.
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - the ID of the turf
 *   - p_date - the date to check availability for (DATE format: YYYY-MM-DD)
 *
 * Output Columns
 * --------------
 *   - start_time_local - available start time in local timezone (TIME format: HH:mm:ss)
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if p_turf_id or p_date is NULL
 *   - Signals SQLSTATE '45002' if no such turf exists
 */
DROP PROCEDURE IF EXISTS get_available_start_times;
DELIMITER $$
CREATE PROCEDURE get_available_start_times(
    IN p_turf_id INT,
    IN p_date DATE
)
BEGIN
    IF (p_turf_id IS NULL) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Turf ID cannot be NULL or empty';
    END IF;

    IF (p_date IS NULL) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Date cannot be NULL or empty';
    END IF;
    
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;
    
    WITH RECURSIVE start_times AS (
        SELECT 
            opens_at_local AS start_time_local,
            closes_at_local,
            iana_timezone
        FROM turf
        WHERE turf_id = p_turf_id
        
        UNION ALL
        
        SELECT 
            ADDTIME(st.start_time_local, '00:30:00') AS start_time_local,
            st.closes_at_local,
            st.iana_timezone
        FROM start_times AS st
        WHERE ADDTIME(st.start_time_local, '00:30:00') < st.closes_at_local
    )
    SELECT st.start_time_local
    FROM start_times st
    WHERE NOT EXISTS (
        SELECT 1 FROM booking b
        WHERE b.turf_id = p_turf_id
        AND convert_local_to_utc(p_date, st.start_time_local, st.iana_timezone) >= b.start_time_utc
        AND convert_local_to_utc(p_date, st.start_time_local, st.iana_timezone) < b.end_time_utc
    )
    ORDER BY st.start_time_local;
END $$
DELIMITER ;

/**
 * Procedure: get_available_end_times
 * ----------------------------------
 * Get all available end times (:29, :59) for a turf on a given date and start time.
 * An end time is available if the range [start_time, end_time] doesn't conflict
 * with any existing booking.
 *
 * Input Parameters
 * ----------------
 *   - p_turf_id - the ID of the turf
 *   - p_date - the date to check availability for (DATE format: YYYY-MM-DD)
 *   - p_start_time - the selected start time (TIME format: HH:mm:ss, must be :00 or :30)
 *
 * Output Columns
 * --------------
 *   - end_time_local - available end time in local timezone (TIME format: HH:mm:ss)
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if any input parameter is NULL
 *   - Signals SQLSTATE '45001' if p_start_time is not at :00 or :30
 *   - Signals SQLSTATE '45002' if no such turf exists
 */
DROP PROCEDURE IF EXISTS get_available_end_times;
DELIMITER $$
CREATE PROCEDURE get_available_end_times(
    IN p_turf_id INT,
    IN p_date DATE,
    IN p_start_time TIME
)
BEGIN
    DECLARE v_start_minute INT;
    DECLARE v_opens_at_local TIME;
    DECLARE v_closes_at_local TIME;
    
    IF (p_turf_id IS NULL) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Turf ID cannot be NULL or empty';
    END IF;

    IF (p_date IS NULL) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Date cannot be NULL or empty';
    END IF;

    IF (p_start_time IS NULL) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Start time cannot be NULL or empty';
    END IF;
    
    -- Validate start time is at :00 or :30
    SET v_start_minute = MINUTE(p_start_time);
    IF (v_start_minute NOT IN (0, 30) OR SECOND(p_start_time) != 0) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Start time must be at :00 or :30 minutes';
    END IF;
    
    IF NOT EXISTS (SELECT turf_id FROM turf WHERE turf_id = p_turf_id) THEN
        SIGNAL SQLSTATE '45002'
        SET MESSAGE_TEXT = 'No such turf exists';
    END IF;
    
    -- Validate that start time is within operational hours
    SELECT opens_at_local, closes_at_local
    INTO v_opens_at_local, v_closes_at_local
    FROM turf
    WHERE turf_id = p_turf_id;
    
    IF (p_start_time < v_opens_at_local OR p_start_time >= v_closes_at_local) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Start time must be within turf operational hours';
    END IF;
    
    WITH RECURSIVE end_times AS (
        SELECT 
            ADDTIME(p_start_time, '00:29:00') AS end_time_local,
            closes_at_local,
            iana_timezone
        FROM turf
        WHERE turf_id = p_turf_id
        
        UNION ALL
        
        SELECT 
            ADDTIME(et.end_time_local, '00:30:00') AS end_time_local,
            et.closes_at_local,
            et.iana_timezone
        FROM end_times AS et
        WHERE ADDTIME(et.end_time_local, '00:30:00') <= et.closes_at_local
    )
    SELECT et.end_time_local
    FROM end_times et
    WHERE NOT EXISTS (
        SELECT 1 FROM booking b
        WHERE b.turf_id = p_turf_id
        AND convert_local_to_utc(p_date, et.end_time_local, et.iana_timezone) > b.start_time_utc
        AND convert_local_to_utc(p_date, et.end_time_local, et.iana_timezone) <= b.end_time_utc
    )
    ORDER BY et.end_time_local;
END $$
DELIMITER ;

/**
 * Procedure: search_turfs
 * -----------------------
 * Search for turfs with optional filters for query string, date, and time range.
 * If date and time range are provided, only returns turfs that are available
 * during that time slot.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_query - Optional search query string to match against turf name, address, or sport name
 *   - p_date - Optional date to check availability (YYYY-MM-DD format)
 *   - p_from_time - Optional start time for availability check (HH:mm format)
 *   - p_to_time - Optional end time for availability check (HH:mm format)
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
DROP PROCEDURE IF EXISTS search_turfs;
DELIMITER $$
CREATE PROCEDURE search_turfs(
    IN p_query VARCHAR(255),
    IN p_date DATE,
    IN p_from_time TIME,
    IN p_to_time TIME
)
BEGIN
    SELECT DISTINCT t.turf_id,
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
    WHERE img.image_index = 0
    -- Search query filter (matches turf name, address fields, or sport name)
    AND (p_query IS NULL OR p_query = '' OR
         t.turf_name LIKE CONCAT('%', p_query, '%') OR
         t.addr_street_1 LIKE CONCAT('%', p_query, '%') OR
         t.addr_street_2 LIKE CONCAT('%', p_query, '%') OR
         t.addr_town LIKE CONCAT('%', p_query, '%') OR
         t.addr_state LIKE CONCAT('%', p_query, '%') OR
         t.addr_zip_code LIKE CONCAT('%', p_query, '%') OR
         t.sport_name LIKE CONCAT('%', p_query, '%')
    )
    -- Availability filter (only if date and time range are provided)
    AND (p_date IS NULL OR p_from_time IS NULL OR p_to_time IS NULL OR
         (
             -- Check that the selected time range is within operational hours
             p_from_time >= t.opens_at_local
             AND p_to_time <= t.closes_at_local
             -- Check that there are no conflicting bookings
             AND NOT EXISTS (
                 SELECT 1 FROM booking b
                 WHERE b.turf_id = t.turf_id
                 AND convert_local_to_utc(p_date, p_from_time, t.iana_timezone) < b.end_time_utc
                 AND convert_local_to_utc(p_date, p_to_time, t.iana_timezone) > b.start_time_utc
             )
         )
    );
END $$
DELIMITER ;
