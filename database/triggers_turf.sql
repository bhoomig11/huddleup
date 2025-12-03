USE huddleup;

/**
 * Trigger: validate_turf_operating_hours_insert
 * ---------------------------------------------
 * Ensures that opens_at_local and closes_at_local are multiples of 30 minutes
 * (i.e., minutes must be 0 or 30, seconds must be 0).
 * 
 * This trigger fires BEFORE INSERT on the turf table.
 */
DROP TRIGGER IF EXISTS validate_turf_operating_hours_insert;
DELIMITER $$
CREATE TRIGGER validate_turf_operating_hours_insert
BEFORE INSERT ON turf
FOR EACH ROW
BEGIN
    DECLARE v_open_minute INT;
    DECLARE v_open_second INT;
    DECLARE v_close_minute INT;
    DECLARE v_close_second INT;
    
    SET v_open_minute = MINUTE(NEW.opens_at_local);
    SET v_open_second = SECOND(NEW.opens_at_local);
    SET v_close_minute = MINUTE(NEW.closes_at_local);
    SET v_close_second = SECOND(NEW.closes_at_local);
    
    -- Validate opening time is a multiple of 30 minutes
    IF (v_open_minute NOT IN (0, 30) OR v_open_second != 0) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Opening time must be at a multiple of 30 minutes (e.g., 06:00, 06:30). Minutes must be 0 or 30, seconds must be 0.';
    END IF;
    
    -- Validate closing time is a multiple of 30 minutes
    IF (v_close_minute NOT IN (0, 30) OR v_close_second != 0) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Closing time must be at a multiple of 30 minutes (e.g., 22:00, 22:30). Minutes must be 0 or 30, seconds must be 0.';
    END IF;
END $$
DELIMITER ;

/**
 * Trigger: validate_turf_operating_hours_update
 * ---------------------------------------------
 * Ensures that opens_at_local and closes_at_local are multiples of 30 minutes
 * (i.e., minutes must be 0 or 30, seconds must be 0).
 * 
 * This trigger fires BEFORE UPDATE on the turf table.
 */
DROP TRIGGER IF EXISTS validate_turf_operating_hours_update;
DELIMITER $$
CREATE TRIGGER validate_turf_operating_hours_update
BEFORE UPDATE ON turf
FOR EACH ROW
BEGIN
    DECLARE v_open_minute INT;
    DECLARE v_open_second INT;
    DECLARE v_close_minute INT;
    DECLARE v_close_second INT;
    
    SET v_open_minute = MINUTE(NEW.opens_at_local);
    SET v_open_second = SECOND(NEW.opens_at_local);
    SET v_close_minute = MINUTE(NEW.closes_at_local);
    SET v_close_second = SECOND(NEW.closes_at_local);
    
    -- Validate opening time is a multiple of 30 minutes
    IF (v_open_minute NOT IN (0, 30) OR v_open_second != 0) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Opening time must be at a multiple of 30 minutes (e.g., 06:00, 06:30). Minutes must be 0 or 30, seconds must be 0.';
    END IF;
    
    -- Validate closing time is a multiple of 30 minutes
    IF (v_close_minute NOT IN (0, 30) OR v_close_second != 0) THEN
        SIGNAL SQLSTATE '45001'
        SET MESSAGE_TEXT = 'Closing time must be at a multiple of 30 minutes (e.g., 22:00, 22:30). Minutes must be 0 or 30, seconds must be 0.';
    END IF;
END $$
DELIMITER ;

