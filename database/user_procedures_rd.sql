USE huddleup;

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
