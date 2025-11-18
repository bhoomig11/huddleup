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
 *   - Signals SQLSTATE '45000' for any invalid input parameter
 */
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
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username cannot be empty';
    ELSEIF EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username is taken';
    END IF;

    IF (p_password_hash IS NULL OR CHAR_LENGTH(p_password_hash) = 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Password hash cannot be empty';
    END IF;

    IF (p_first_name IS NULL OR CHAR_LENGTH(p_first_name) = 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'First name cannot be empty';
    END IF;

    IF (p_email IS NULL OR CHAR_LENGTH(p_email) = 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email cannot be empty';
    ELSEIF EXISTS (SELECT email FROM app_user WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email already in use';
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
 *   - Signals SQLSTATE '45000' with message 'User not found' if no user exists
 *     with the given username.
 */
DELIMITER $$
CREATE PROCEDURE get_user_login_details(IN p_username VARCHAR(64))
BEGIN
    DECLARE v_password_hash VARCHAR(60);

    SELECT password_hash INTO v_password_hash
    FROM app_user
    WHERE username = p_username;

    IF (v_password_hash IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found';
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
 *   - announcement_title - the title of the announcement
 *   - sent_at - the datetime representing when the announcement was sent
 *   - read_at - the datetime representing when the announcement was read
 *
 *
 * Errors
 * ------
 *   - Signals SQLSTATE '45000' if the provided username is NULL.
 */
DELIMITER $$
CREATE PROCEDURE get_all_user_announcements(IN p_username VARCHAR(64))
BEGIN
    IF (p_username IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Username cannot be NULL';
    END IF;

    SELECT announcement_title, sent_at, read_at
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
 *   - Signals SQLSTATE '45000' if no such announcement exists for the user.
 */
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
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No such announcement found';
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
 *   - Signals SQLSTATE '45000' if no such announcement exists for the user.
 */
DELIMITER $$
CREATE PROCEDURE mark_announcement_as_read(IN p_username VARCHAR(64), IN p_announcement_id INT)
BEGIN
    UPDATE announcement_read_receipt
    SET read_at = UTC_TIMESTAMP()
    WHERE username = p_username AND announcement_id = p_announcement_id;

    IF (ROW_COUNT() = 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No such announcement found';
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
 *   - Signals SQLSTATE '45000' if no such user exists.
 */
DELIMITER $$
CREATE PROCEDURE mark_all_announcements_as_read(IN p_username VARCHAR(64))
BEGIN
    IF NOT EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No such user exists';
    END IF;

    UPDATE announcement_read_receipt
    SET read_at = UTC_TIMESTAMP()
    WHERE username = p_username AND read_at IS NULL;
END $$
DELIMITER ;
