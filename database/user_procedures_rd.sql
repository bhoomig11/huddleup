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
