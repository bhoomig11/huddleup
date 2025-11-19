USE huddleup;

/**
 * Function: is_username_taken
 * ---------------------------
 * Check if a provided username is already in use.
 *
 *
 * Parameters
 * ----------
 *   - p_username - the username to check for
 *
 *
 * Returns
 * -------
 * TRUE if the username is already in use, FALSE otherwise.
 */
DELIMITER $$
CREATE FUNCTION is_username_taken(p_username VARCHAR(64))
RETURNS BOOLEAN
DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE user_exists BOOLEAN DEFAULT FALSE;

    IF EXISTS (SELECT username FROM app_user WHERE username = p_username) THEN
        SET user_exists = TRUE;
    END IF;

    RETURN user_exists;
END $$
DELIMITER ;
