CREATE DATABASE IF NOT EXISTS huddleup;
USE huddleup;

/* Entities */
CREATE TABLE employee (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64),
    email VARCHAR(64) UNIQUE NOT NULL,
    ssn CHAR(9) UNIQUE NOT NULL,
    img_url VARCHAR(255),
    birth_date DATE,
    addr_street_1 VARCHAR(64),
    addr_street_2 VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state CHAR(2),
    addr_zip_code VARCHAR(64),
    password_hash VARCHAR(60) NOT NULL,
    title VARCHAR(64) NOT NULL,
    hourly_wage DECIMAL(7, 2) NOT NULL,
    joining_date DATE NOT NULL,
    reports_to INT,
    CONSTRAINT fk_employee_supervisor
    FOREIGN KEY (reports_to)
    REFERENCES employee (employee_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE payslip (
    employee_id INT,
    date_of_payment DATE,
    amount_paid DECIMAL(19, 2) NOT NULL,
    CONSTRAINT pk_payslip PRIMARY KEY (employee_id, date_of_payment),
    CONSTRAINT fk_payslip_employee
    FOREIGN KEY (employee_id)
    REFERENCES employee (employee_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE timesheet_entry (
    employee_id INT,
    work_date DATE,
    start_time TIME,
    end_time TIME NOT NULL,
    task_description VARCHAR(255) NOT NULL,
    CONSTRAINT pk_timesheet_entry PRIMARY KEY (employee_id, work_date, start_time),
    CONSTRAINT fk_timesheet_entry_employee
    FOREIGN KEY (employee_id)
    REFERENCES employee (employee_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE sport_type (
    sport_name VARCHAR(64) PRIMARY KEY
);

CREATE TABLE turf (
    turf_id INT PRIMARY KEY AUTO_INCREMENT,
    turf_name VARCHAR(64) NOT NULL,
    turf_description VARCHAR(255),
    floor_material VARCHAR(64),
    floor_width DECIMAL(6, 2),
    floor_length DECIMAL(6, 2),
    hourly_rate DECIMAL(10, 2) NOT NULL,
    opens_at_utc TIME NOT NULL,
    closes_at_utc TIME NOT NULL,
    manager_id INT NOT NULL,
    addr_street_1 VARCHAR(64),
    addr_street_2 VARCHAR(64),
    addr_state CHAR(2),
    addr_zip_code CHAR(5),
    sport_name VARCHAR(64) NOT NULL,
    CONSTRAINT fk_turf_sport_type
    FOREIGN KEY (sport_name)
    REFERENCES sport_type (sport_name)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
    CONSTRAINT fk_turf_manager_id
    FOREIGN KEY (manager_id)
    REFERENCES employee (employee_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE turf_feature (
    feat_name VARCHAR(64) PRIMARY KEY,
    feat_description VARCHAR(255)
);

CREATE TABLE turf_image (
    image_index INT,
    turf_id INT,
    image_url VARCHAR(255) NOT NULL,
    CONSTRAINT pk_turf_image PRIMARY KEY (turf_id, image_index),
    CONSTRAINT fk_turf_image_turf
    FOREIGN KEY (turf_id)
    REFERENCES turf (turf_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE announcement (
    announcement_id INT PRIMARY KEY AUTO_INCREMENT,
    announcement_message VARCHAR(255) NOT NULL
);

CREATE TABLE app_user (
    username VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64),
    email VARCHAR(64) UNIQUE NOT NULL,
    addr_street_1 VARCHAR(64),
    addr_street_2 VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state CHAR(2),
    addr_zip_code VARCHAR(64),
    password_hash VARCHAR(60) NOT NULL,
    birth_date DATE
);

CREATE TABLE card_detail (
    card_id INT PRIMARY KEY AUTO_INCREMENT,
    card_number VARCHAR(19) NOT NULL,
    name_on_card VARCHAR(64) NOT NULL,
    expiry_date DATE NOT NULL,
    addr_street_1 VARCHAR(64),
    addr_street_2 VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state CHAR(2),
    addr_zip_code VARCHAR(64),
    username VARCHAR(64) NOT NULL,
    CONSTRAINT fk_card_detail_user
    FOREIGN KEY (username)
    REFERENCES app_user (username)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE TABLE coupon (
    coupon_id INT PRIMARY KEY AUTO_INCREMENT,
    coupon_code VARCHAR(20) NOT NULL,
    coupon_description VARCHAR(255),
    discount_percent INT NOT NULL,
    coupon_start_date DATE NOT NULL,
    coupon_end_date DATE NOT NULL,
    min_booking_amt DECIMAL(19, 2)
);

CREATE TABLE booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    start_time_utc TIME NOT NULL,
    duration_mins INT NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    complaint_subject VARCHAR(64),
    complaint_description VARCHAR(255),
    complaint_filed_at_utc DATETIME,
    complaint_resolved_at_utc DATETIME,
    turf_id INT NOT NULL,
    username VARCHAR(64) NOT NULL,
    masked_card_number VARCHAR(19),
    coupon_id INT,
    CONSTRAINT fk_booking_turf
    FOREIGN KEY (turf_id)
    REFERENCES turf (turf_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
    CONSTRAINT fk_booking_app_user
    FOREIGN KEY (username)
    REFERENCES app_user (username)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    CONSTRAINT fk_booking_coupon
    FOREIGN KEY (coupon_id)
    REFERENCES coupon (coupon_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

/* turf includes feature */
CREATE TABLE turf_to_feature (
    turf_id INT,
    feature_name VARCHAR(64),
    CONSTRAINT pk_ttf PRIMARY KEY (turf_id, feature_name),
    CONSTRAINT fk_ttf_turf
    FOREIGN KEY (turf_id)
    REFERENCES turf (turf_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    CONSTRAINT fk_ttf_feature
    FOREIGN KEY (feature_name)
    REFERENCES turf_feature (feat_name)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);


/* user reviews turf */
CREATE TABLE review (
    turf_id INT NOT NULL,
    username VARCHAR(64),
    rating INT NOT NULL,
    review VARCHAR(255),
    CONSTRAINT pk_review PRIMARY KEY (turf_id, username),
    CONSTRAINT fk_review_user
    FOREIGN KEY (username)
    REFERENCES app_user (username)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
    CONSTRAINT fk_review_turf
    FOREIGN KEY (turf_id)
    REFERENCES turf (turf_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    CONSTRAINT rating_range_check
    CHECK (rating >= 1 AND rating <= 5)
);

/* user receives announcement */
CREATE TABLE announcement_read_receipt (
    announcement_id INT,
    username VARCHAR(64),
    sent_at DATETIME NOT NULL,
    read_at DATETIME,
    CONSTRAINT pk_anc_read_receipt PRIMARY KEY (announcement_id, username),
    CONSTRAINT fk_anc_read_receipt_user
    FOREIGN KEY (username)
    REFERENCES app_user (username)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
    CONSTRAINT fk_anc_read_receipt_announcement
    FOREIGN KEY (announcement_id)
    REFERENCES announcement (announcement_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
