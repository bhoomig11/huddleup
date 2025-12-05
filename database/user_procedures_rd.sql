USE huddleup;

/**
 * Procedure: create_new_user
 * --------------------------
 * Create a new user for the application.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user (must be unique)
 *   - p_password_hash - the hash for the user's password
 *   - p_first_name - the first name of the user
 *   - p_last_name - (optional) the last name of the user
 *   - p_email - the email address of the user (must be unique)
 *   - p_birth_date - (optional) the birth date of the user
 *   - p_addr_street_1 - (optional) the primary street address line of the user
 *   - p_addr_street_2 - (optional) the secondary street address line of the user
 *   - p_addr_town - (optional) the town or city of the user
 *   - p_addr_state - (optional) the state code of the user
 *   - p_addr_zip_code - (optional) the postal or ZIP code of the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' for any invalid input parameter
 *   - Signals SQLSTATE '45003' if a user identifier (like username or email) is already in use
 */
DROP PROCEDURE IF EXISTS create_new_user;
DELIMITER $$
CREATE PROCEDURE create_new_user (
    IN p_username VARCHAR(64),
    IN p_password_hash VARCHAR(60),
    IN p_first_name VARCHAR(64),
    IN p_last_name VARCHAR(64),
    IN p_email VARCHAR(64),
    IN p_birth_date DATE,
    IN p_addr_street_1 VARCHAR(64),
    IN p_addr_street_2 VARCHAR(64),
    IN p_addr_town VARCHAR(64),
    IN p_addr_state CHAR(2),
    IN p_addr_zip_code VARCHAR(64)
)
BEGIN
    IF (p_username IS NULL OR CHAR_LENGTH(p_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Username is taken';
    END IF;

    IF (p_password_hash IS NULL OR CHAR_LENGTH(p_password_hash) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Password hash cannot be empty';
    END IF;

    IF (p_first_name IS NULL OR CHAR_LENGTH(p_first_name) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'First name cannot be empty';
    END IF;

    IF (p_email IS NULL OR CHAR_LENGTH(p_email) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Email cannot be empty';
    ELSEIF EXISTS (SELECT email FROM app_user WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Email already in use';
    END IF;

    INSERT INTO app_user (
        username,
        password_hash,
        first_name,
        last_name,
        email,
        birth_date,
        addr_street_1,
        addr_street_2,
        addr_town,
        addr_state,
        addr_zip_code
    )
    VALUES (
        p_username,
        p_password_hash,
        p_first_name,
        p_last_name,
        p_email,
        p_birth_date,
        p_addr_street_1,
        p_addr_street_2,
        p_addr_town,
        p_addr_state,
        p_addr_zip_code
    );
END $$
DELIMITER ;

/**
 * Procedure: get_user_login_details
 * ---------------------------------
 * Retrieve authentication data (username and password hash) needed to log in a
 * given user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - The username of the user to look up
 *
 *
 * Output Columns
 * --------------
 *   - username - The username of the user
 *   - password_hash - The stored password hash for the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no user exists with the given username.
 */
DROP PROCEDURE IF EXISTS get_user_login_details;
DELIMITER $$
CREATE PROCEDURE get_user_login_details(IN p_username VARCHAR(64))
BEGIN
    DECLARE v_password_hash VARCHAR(60);

    SELECT password_hash INTO v_password_hash
    FROM app_user
    WHERE username = p_username;

    IF (v_password_hash IS NULL) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'User not found';
    ELSE
        SELECT p_username AS username, v_password_hash AS password_hash;
    END IF;
END $$
DELIMITER ;

/**
 * Procedure: get_all_user_announcements
 * -------------------------------------
 * Retrieve all announcements for a user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *
 *
 * Output Columns
 * --------------
 *   - announcement_id - the ID of the announcement
 *   - announcement_title - the title of the announcement
 *   - sent_at - the datetime representing when the announcement was sent
 *   - read_at - the datetime representing when the announcement was read
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45001' if the provided username is NULL.
 */
DROP PROCEDURE IF EXISTS get_all_user_announcements;
DELIMITER $$
CREATE PROCEDURE get_all_user_announcements(IN p_username VARCHAR(64))
BEGIN
    IF (p_username IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Username cannot be NULL';
    END IF;

    SELECT announcement_id, announcement_title, sent_at, read_at
    FROM announcement_read_receipt
    INNER JOIN announcement USING (announcement_id)
    WHERE username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: get_user_announcement
 * --------------------------------
 * Retrieve a particular announcement for a user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_announcement_id - the desired announcement's ID
 *
 *
 * Output Columns
 * --------------
 *   - announcement_title - the title of the announcement
 *   - announcement_message - the message content of the announcement
 *   - sent_at - the datetime representing when the announcement was sent
 *   - read_at - the datetime representing when the announcement was read
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such announcement exists for the user.
 */
DROP PROCEDURE IF EXISTS get_user_announcement;
DELIMITER $$
CREATE PROCEDURE get_user_announcement(IN p_username VARCHAR(64), IN p_announcement_id INT)
BEGIN
    DECLARE v_announcement_title VARCHAR(100);
    DECLARE v_announcement_message VARCHAR(255);
    DECLARE v_sent_at DATETIME;
    DECLARE v_read_at DATETIME;

    DECLARE no_data_found CONDITION FOR SQLSTATE '02000';

    DECLARE CONTINUE HANDLER FOR no_data_found
    BEGIN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such announcement found';
    END;

    SELECT anc.announcement_title, anc.announcement_message, arr.sent_at, arr.read_at
    INTO v_announcement_title, v_announcement_message, v_sent_at, v_read_at
    FROM announcement AS anc
    INNER JOIN announcement_read_receipt AS arr ON anc.announcement_id = arr.announcement_id
    WHERE arr.username = p_username AND anc.announcement_id = p_announcement_id;

    SELECT
        v_announcement_title AS announcement_title,
        v_announcement_message AS announcement_message,
        v_sent_at AS sent_at,
        v_read_at AS read_at;
END $$
DELIMITER ;

/**
 * Procedure: mark_announcement_as_read
 * ------------------------------------
 * Mark an announcement as read at the current UTC timestamp.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_announcement_id - the desired announcement's ID
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such announcement exists for the user.
 */
DROP PROCEDURE IF EXISTS mark_announcement_as_read;
DELIMITER $$
CREATE PROCEDURE mark_announcement_as_read(IN p_username VARCHAR(64), IN p_announcement_id INT)
BEGIN
    UPDATE announcement_read_receipt
    SET read_at = UTC_TIMESTAMP()
    WHERE username = p_username AND announcement_id = p_announcement_id;

    IF (ROW_COUNT() = 0) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such announcement found';
    END IF;
END $$
DELIMITER ;

/**
 * Procedure: mark_all_announcements_as_read
 * -----------------------------------------
 * Mark all announcements for a user as read at the current UTC timestamp.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 */
DROP PROCEDURE IF EXISTS mark_all_announcements_as_read;
DELIMITER $$
CREATE PROCEDURE mark_all_announcements_as_read(IN p_username VARCHAR(64))
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    UPDATE announcement_read_receipt
    SET read_at = UTC_TIMESTAMP()
    WHERE username = p_username AND read_at IS NULL;
END $$
DELIMITER ;

/**
 * Procedure: get_user_profile
 * ---------------------------
 * Get a user's profile details.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *
 *
 * Output Columns
 * --------------
 *   - username - the username of the user
 *   - first_name - the first name of the user
 *   - last_name - the last name of the user
 *   - email - the email address of the user
 *   - birth_date - the birth date of the user
 *   - addr_street_1 - the primary street address line of the user
 *   - addr_street_2 - the secondary street address line of the user
 *   - addr_town - the town or city of the user
 *   - addr_state - the state code of the user
 *   - addr_zip_code - the postal or ZIP code of the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 */
DROP PROCEDURE IF EXISTS get_user_profile;
DELIMITER $$
CREATE PROCEDURE get_user_profile(IN p_username VARCHAR(64))
BEGIN
    DECLARE v_username VARCHAR(64);
    DECLARE v_first_name VARCHAR(64);
    DECLARE v_last_name VARCHAR(64);
    DECLARE v_email VARCHAR(64);
    DECLARE v_birth_date DATE;
    DECLARE v_addr_street_1 VARCHAR(64);
    DECLARE v_addr_street_2 VARCHAR(64);
    DECLARE v_addr_town VARCHAR(64);
    DECLARE v_addr_state CHAR(2);
    DECLARE v_addr_zip_code CHAR(5);

    SELECT
        username,
        first_name,
        last_name,
        email,
        birth_date,
        addr_street_1,
        addr_street_2,
        addr_town,
        addr_state,
        addr_zip_code
    INTO
        v_username,
        v_first_name,
        v_last_name,
        v_email,
        v_birth_date,
        v_addr_street_1,
        v_addr_street_2,
        v_addr_town,
        v_addr_state,
        v_addr_zip_code
    FROM
        app_user
    WHERE
        username = p_username;

    IF (v_username IS NULL) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    SELECT
        v_username AS username,
        v_first_name AS first_name,
        v_last_name AS last_name,
        v_email AS email,
        v_birth_date AS birth_date,
        v_addr_street_1 AS addr_street_1,
        v_addr_street_2 AS addr_street_2,
        v_addr_town AS addr_town,
        v_addr_state AS addr_state,
        v_addr_zip_code AS addr_zip_code;
END $$
DELIMITER ;

/**
 * Procedure: update_user_profile
 * ------------------------------
 * Update a user's profile information
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_first_name - the first name of the user
 *   - p_last_name - the last name of the user
 *   - p_birth_date - the birth date of the user
 *   - p_addr_street_1 - the primary street address line of the user
 *   - p_addr_street_2 - the secondary street address line of the user
 *   - p_addr_town - the town or city of the user
 *   - p_addr_state - the state code of the user
 *   - p_addr_zip_code - the postal or ZIP code of the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 */
DROP PROCEDURE IF EXISTS update_user_profile;
DELIMITER $$
CREATE PROCEDURE update_user_profile(
    IN p_username VARCHAR(64),
    IN p_first_name VARCHAR(64),
    IN p_last_name VARCHAR(64),
    IN p_birth_date DATE,
    IN p_addr_street_1 VARCHAR(64),
    IN p_addr_street_2 VARCHAR(64),
    IN p_addr_town VARCHAR(64),
    IN p_addr_state CHAR(2),
    IN p_addr_zip_code CHAR(5)
)
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    UPDATE app_user
    SET
        first_name = p_first_name,
        last_name = p_last_name,
        birth_date = p_birth_date,
        addr_street_1 = p_addr_street_1,
        addr_street_2 = p_addr_street_2,
        addr_town = p_addr_town,
        addr_state = p_addr_state,
        addr_zip_code = p_addr_zip_code
    WHERE
        username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: update_username
 * --------------------------
 * Update a user's username.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_current_username - the user's current username
 *   - p_new_username - the user's updated username
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no user exists with the old username.
 *   - Signals SQLSTATE '45001' if the new username is null or empty.
 *   - Signals SQLSTATE '45003' if the new username is already taken.
 */
DROP PROCEDURE IF EXISTS update_username;
DELIMITER $$
CREATE PROCEDURE update_username(IN p_current_username VARCHAR(64), IN p_new_username VARCHAR(64))
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_current_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    IF (p_new_username IS NULL OR CHAR_LENGTH(p_new_username) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'New username cannot be empty';
    ELSEIF EXISTS (SELECT username FROM app_user WHERE username = p_new_username) THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Username is taken';
    END IF;

    UPDATE app_user
    SET username = p_new_username
    WHERE username = p_current_username;
END $$
DELIMITER ;

/**
 * Procedure: update_user_password
 * -------------------------------
 * Update a user's password hash.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_password_hash - the updated password hash for the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 *   - Signals SQLSTATE '45001' if the password hash is null or empty.
 */
DROP PROCEDURE IF EXISTS update_user_password;
DELIMITER $$
CREATE PROCEDURE update_user_password(IN p_username VARCHAR(64), IN p_password_hash VARCHAR(60))
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    IF (p_password_hash IS NULL OR CHAR_LENGTH(p_password_hash) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Password hash cannot be empty';
    END IF;

    UPDATE app_user
    SET password_hash = p_password_hash
    WHERE username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: update_user_email
 * ----------------------------
 * Update a user's email address.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_email - the updated email address of the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 *   - Signals SQLSTATE '45001' if the email address is null or empty.
 *   - Signals SQLSTATE '45003' if the email address is already in use.
 */
DROP PROCEDURE IF EXISTS update_user_email;
DELIMITER $$
CREATE PROCEDURE update_user_email(IN p_username VARCHAR(64), IN p_email VARCHAR(64))
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    IF (p_email IS NULL OR CHAR_LENGTH(p_email) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Email cannot be empty';
    ELSEIF EXISTS (SELECT email FROM app_user WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'Email already in use';
    END IF;

    UPDATE app_user
    SET email = p_email
    WHERE username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: delete_user
 * ----------------------
 * Delete a user from the database.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 */
DROP PROCEDURE IF EXISTS delete_user;
DELIMITER $$
CREATE PROCEDURE delete_user(IN p_username VARCHAR(64))
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    DELETE FROM app_user WHERE username = p_username;
END $$
DELIMITER ;

/**
 * Procedure: add_user_card_detail
 * -------------------------------
 * Add details of a new card for a user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_card_number - the card number of the new card (with no surrounding or interim whitespace)
 *   - p_name_on_card - the registered name on the card
 *   - p_expiry_month - the 2-digit numeric expiry month of the card (e.g. "09")
 *   - p_expiry_year  - the full 4-digit expiry year of the card (e.g. "2027")
 *   - p_addr_street_1 - primary street address line of the card's billing address
 *   - p_addr_street_2 - secondary street address line (optional, e.g., apartment or suite number)
 *   - p_addr_town - city/town of the billing address
 *   - p_addr_state - 2-letter state code of the billing address (e.g., "CA", "NY")
 *   - p_addr_zip_code - 5-digit ZIP code of the billing address
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such user exists.
 *   - Signals SQLSTATE '45001' if the card number is not provided.
 *   - Signals SQLSTATE '45001' if the name on the card is not provided.
 *   - Signals SQLSTATE '45001' if the card expiry date is invalid.
 *   - Signals SQLSTATE '45001' if any of the billing address components are not provided.
 */
DROP PROCEDURE IF EXISTS add_user_card_detail;
DELIMITER $$
CREATE PROCEDURE add_user_card_detail(
    IN p_username VARCHAR(64),
    IN p_card_number VARCHAR(19),
    IN p_name_on_card VARCHAR(64),
    IN p_expiry_month CHAR(2),
    IN p_expiry_year CHAR(4),
    IN p_addr_street_1 VARCHAR(64),
    IN p_addr_street_2 VARCHAR(64),
    IN p_addr_town VARCHAR(64),
    IN p_addr_state CHAR(2),
    IN p_addr_zip_code CHAR(5)
)
BEGIN
    DECLARE v_first_of_expiry_month DATE;
    DECLARE v_expiry_date DATE;

    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    IF (p_card_number IS NULL OR CHAR_LENGTH(p_card_number) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Card number cannot be empty';
    END IF;

    IF (p_name_on_card IS NULL OR CHAR_LENGTH(p_name_on_card) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Name on card cannot be empty';
    END IF;

    IF (p_expiry_month IS NOT NULL AND p_expiry_year IS NOT NULL) THEN
        SET v_first_of_expiry_month = DATE(CONCAT_WS("-", p_expiry_year, p_expiry_month, "01"));
        SET v_expiry_date = LAST_DAY(v_first_of_expiry_month);
    END IF;

    IF (v_expiry_date IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Invalid card expiry date';
    END IF;

    IF (p_addr_street_1 IS NULL OR CHAR_LENGTH(p_addr_street_1) = 0) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Card billing address (line 1) cannot be empty';
    END IF;

    IF (p_addr_town IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Card billing address town cannot be empty';
    END IF;

    IF (p_addr_state IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Card billing address state cannot be empty';
    END IF;

    IF (p_addr_zip_code IS NULL) THEN
        SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'Card billing address zip code cannot be empty';
    END IF;

    INSERT INTO card_detail (
        username,
        card_number,
        name_on_card,
        expiry_date,
        addr_street_1,
        addr_street_2,
        addr_town,
        addr_state,
        addr_zip_code
    )
    VALUES (
        p_username,
        p_card_number,
        p_name_on_card,
        v_expiry_date,
        p_addr_street_1,
        p_addr_street_2,
        p_addr_town,
        p_addr_state,
        p_addr_zip_code
    );
END $$
DELIMITER ;

/**
 * Procedure: delete_user_card_detail
 * ----------------------------------
 * Delete details of an existing card for a user.
 *
 *
 * Input Parameters
 * ----------------
 *   - p_username - the username of the user
 *   - p_card_id - the ID of the card to be deleted
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45002' if no such card exists for the user.
 */
DROP PROCEDURE IF EXISTS delete_user_card_detail;
DELIMITER $$
CREATE PROCEDURE delete_user_card_detail(
    IN p_username VARCHAR(64),
    IN p_card_id INT
)
BEGIN
    IF NOT EXISTS (
        SELECT card_id FROM card_detail WHERE username = p_username AND card_id = p_card_id
    ) THEN
        SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'No such card found for this user';
    END IF;

    DELETE FROM card_detail WHERE card_id = p_card_id;
END $$
DELIMITER ;
