CREATE DATABASE huddleup;
USE huddleup;

CREATE TABLE sport_type (
    sport_name VARCHAR(64) PRIMARY KEY
);

CREATE TABLE turf (
    turf_id INT primary key,
    turf_name VARCHAR(64) UNIQUE NOT NULL,
    turf_description VARCHAR(255),
    floor_material VARCHAR(64), 
    floor_width DECIMAL(6,2),
    floor_length DECIMAL(6,2),
    hourly_rate INT NOT NULL,
    opens_at TIME NOT NULL,
    closes_at TIME NOT NULL,
	addr_street_no INT,
    addr_street_name VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state VARCHAR(64),
    addr_zip_code VARCHAR(64),
    sport_name VARCHAR(64) NOT NULL,
    CONSTRAINT defines
    FOREIGN KEY (sport_name) 
        REFERENCES sport_type(sport_name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE user (
	username VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64),
    email VARCHAR(64) UNIQUE NOT NULL,
    addr_street_no INT,
    addr_street_name VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state VARCHAR(64),
    addr_zip_code VARCHAR(64),
    password_hash VARCHAR(60) NOT NULL,
    birth_date DATE
);

CREATE TABLE announcements (
	id INT PRIMARY KEY,
    massage VARCHAR(255) NOT NULL
);

CREATE TABLE turf_feature (
	feat_name VARCHAR(64) PRIMARY KEY NOT NULL,
    feat_description VARCHAR(255) NOT NULL
);

CREATE TABLE turf_image (
	image_id INT PRIMARY KEY,
	image_index INT NOT NULL,
	image_url VARCHAR(255) NOT NULL,
    turf_id INT NOT NULL,
    CONSTRAINT displays 
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

/* user reviews turfs */ 
CREATE TABLE review (
	rating INT CHECK (Rating >= 1 AND Rating <= 5) NOT NULL,
    review VARCHAR(255),
    username VARCHAR(64) NOT NULL,
    turf_id INT NOT NULL,
    CONSTRAINT user_fk 
		FOREIGN KEY (username) 
        REFERENCES user(username)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
	CONSTRAINT turf_fk 
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE card_detail (
	card_number INT NOT NULL,
    name_on_card VARCHAR(64) NOT NULL,
    expiry_month INT NOT NULL,
    expiry_year INT NOT NULL,
    security_code INT NOT NULL,
    addr_street_no INT,
    addr_street_name VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state VARCHAR(64),
    addr_zip_code VARCHAR(64),
    username VARCHAR(64) NOT NULL,
    PRIMARY KEY (card_number, month, year),
    CONSTRAINT uses 
        FOREIGN KEY(username)
        REFERENCES user(username)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE booking (
	booking_id INT PRIMARY KEY,
    start_time TIME NOT NULL,
    duration TIME NOT NULL,
    amount INT NOT NULL,
    complaint_subject VARCHAR(64),
    complaint_description VARCHAR(255),
    complaint_filed_at DATETIME,
    complaint_resolved_at DATETIME,
    turf_id INT NOT NULL,
    card_number INT UNIQUE,
    expiry_month INT NOT NULL,
    expiry_year INT NOT NULL,
    coupon_code INT,
    coupon_start_date DATE,
    CONSTRAINT reserves
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT confirms
        FOREIGN KEY (card_number, expiry_month, expiry_year)
        REFERENCES card_detail(card_number, expiry_month, expiry_year)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT applies_to
        FOREIGN KEY (coupon_code, coupon_start_date)
        REFERENCES coupon(coupon_code, coupon_start_date)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE coupon (
    coupon_code VARCHAR(20) NOT NULL,
    coupon_description VARCHAR(255) NOT NULL,
    discount_percent INT NOT NULL,
    coupon_start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    min_booking_amt INT NOT NULL,
    PRIMARY KEY (coupon_code, coupon_start_date)
);

CREATE TABLE employee (
	employee_id INT PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64),
    email VARCHAR(64) UNIQUE NOT NULL,
    ssn INT UNIQUE NOT NULL,
    img_url VARCHAR(255),
    birth_date DATE,
    addr_street_no INT,
    addr_street_name VARCHAR(64),
    addr_town VARCHAR(64),
    addr_state VARCHAR(64),
    addr_zip_code VARCHAR(64),
    password_hash VARCHAR(60) NOT NULL,
    title VARCHAR(64) NOT NULL,
    emp_level ENUM('staff', 'manager', 'regional_manager', 'executive'),
    hourly_wage INT NOT NULL,
    joining_date DATE NOT NULL,
    turf_assigned INT NOT NULL,
    reg_manager_id INT,
    CONSTRAINT assigned_to
        FOREIGN KEY (turf_assigned)
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    CONSTRAINT reports_to
        FOREIGN KEY (reg_manager_id)
        REFERENCES employee(employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE timesheet_entry (
    entry_id INT PRIMARY KEY,
    entry_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    task_description VARCHAR(255) NOT NULL
    employee_id INT,
    payslip_id INT NOT NULL
    CONSTRAINT logs
        FOREIGN KEY(employee_id)
        REFERENCES employee(employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT creates
        FOREIGN KEY(payslip_id)
        REFERENCES payslip(payslip_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE payslip(
    payslip_id INT PRIMARY KEY,
    amount_paid DECIMAL(19,2) NOt NULL,
    date_of_payment DATE NOT NULL,
);

CREATE TABLE features (
    turf_id INT NOT NULL,
    feature_name VARCHAR(64) NOT NULL,
    CONSTRAINT turf_fk 
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT feature_fk 
		FOREIGN KEY (feature_name) 
        REFERENCES turf_feature(feat_name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

/* user reviews turfs */ 
CREATE TABLE reviews (
	rating INT CHECK (Rating >= 1 AND Rating <= 5) NOT NULL,
    review VARCHAR(255),
    username VARCHAR(64) NOT NULL,
    turf_id INT NOT NULL,
    CONSTRAINT user_fk 
		FOREIGN KEY (username) 
        REFERENCES user(username)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
	CONSTRAINT turf_fk 
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE receive_announcement (
	read_at DATETIME,
    sent_at DATETIME NOT NULL,
	announcement_id INT NOT NULL,
    username VARCHAR(64) NOT NULL,
    CONSTRAINT user_fk 
		FOREIGN KEY (username) 
        REFERENCES user(username)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
	CONSTRAINT announcement_fk 
		FOREIGN KEY (announcement_id) 
        REFERENCES announcements(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);