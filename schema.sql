-- ==========================================================================
-- QuakeGuard PostgreSQL Database Schema
-- ==========================================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    blood_type VARCHAR(10),
    emergency_contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE earthquakes (
    id VARCHAR(100) PRIMARY KEY,
    magnitude NUMERIC(3,1) NOT NULL,
    place VARCHAR(255) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    depth_km NUMERIC(5,2) NOT NULL,
    event_time TIMESTAMP NOT NULL
);

CREATE TABLE community_reports (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    incident_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shelters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    occupied_count INT DEFAULT 0,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL
);

-- Seed Data: Verified Historical Earthquakes (Tamil Nadu, India & Japan)
INSERT INTO earthquakes (id, magnitude, place, latitude, longitude, depth_km, event_time) VALUES
('hq_tn1', 5.6, '2001 Cuddalore-Puducherry Coast Earthquake (Tamil Nadu)', 11.950000, 79.830000, 10.00, '2001-09-25 14:30:00'),
('hq_tn2', 6.0, '1900 Coimbatore Earthquake (Tamil Nadu Moyar Shear)', 10.990000, 76.960000, 15.00, '1900-02-08 03:00:00'),
('hq_tn3', 9.1, '2004 Sumatra Tsunami Impact (Nagapattinam & Chennai, TN)', 3.316000, 95.854000, 30.00, '2004-12-26 00:58:53'),
('hq_in1', 7.7, '2001 Bhuj Gujarat Earthquake (India)', 23.419000, 70.232000, 16.00, '2001-01-26 03:16:40'),
('hq_in2', 6.2, '1993 Killari Latur Earthquake (Peninsular India)', 18.080000, 76.520000, 10.00, '1993-09-30 03:55:00'),
('hq_jp1', 9.1, '2011 Great East Japan (Tohoku) Megathrust Earthquake', 38.297000, 142.372000, 29.00, '2011-03-11 05:46:24'),
('hq_jp2', 7.5, '2024 Noto Peninsula Earthquake (Ishikawa, Japan)', 37.500000, 137.200000, 10.00, '2024-01-01 07:10:09'),
('hq_jp3', 6.9, '1995 Great Hanshin Kobe Earthquake (Japan)', 34.583000, 135.033000, 16.00, '1995-01-17 05:46:53');
