CREATE DATABASE huddleup;
USE huddleup;

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
	street_no INT,
    street_name VARCHAR(64),
    town VARCHAR(64),
    state VARCHAR(64),
    zip_code VARCHAR(64)
);

CREATE TABLE user (
	username VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64),
    email VARCHAR(64) UNIQUE NOT NULL,
    street_no INT,
    street_name VARCHAR(64),
    town VARCHAR(64),
    state VARCHAR(64),
    zip_code VARCHAR(64),
    password VARCHAR(60) NOT NULL,
    birth_date DATE
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

CREATE TABLE announcements (
	id INT PRIMARY KEY,
    massage VARCHAR(255) NOT NULL
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

CREATE TABLE employee (
	employee_id INT PRIMARY KEY,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64),
    email VARCHAR(64) UNIQUE NOT NULL,
    ssn INT UNIQUE NOT NULL,
    img_url VARCHAR(255),
    birth_date DATE,
    street_no INT,
    street_name VARCHAR(64),
    town VARCHAR(64),
    state VARCHAR(64),
    zip_code VARCHAR(64),
    password VARCHAR(60) NOT NULL,
    title VARCHAR(64) NOT NULL,
    level ENUM('staff', 'manager', 'regional_manager', 'executive'),
    hourly_wage INT NOT NULL,
    start_date DATE NOT NULL
);

/* All entities/relationship related to turf */
CREATE TABLE turf_feature (
	name VARCHAR(64) PRIMARY KEY NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE turf_image (
	image_id INT PRIMARY KEY,
	image_index INT NOT NULL,
	image_url VARCHAR(255) NOT NULL,
    turf_id INT NOT NULL,
    CONSTRAINT turf_fk 
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE sport_type (
	name VARCHAR(64) PRIMARY KEY
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
	card_number INT PRIMARY KEY,
    name_on_card VARCHAR(64) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    security_code INT NOT NULL,
    street_no INT,
    street_name VARCHAR(64),
    town VARCHAR(64),
    state VARCHAR(64),
    zip_code VARCHAR(64)
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
    CONSTRAINT turf_fk 
		FOREIGN KEY (turf_id) 
        REFERENCES turf(turf_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

