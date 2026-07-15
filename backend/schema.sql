-- Legacy reference schema. Prefer `npm run migrate` and files in migrations/.
-- Kept for readability; seed.js no longer executes this file.

CREATE DATABASE IF NOT EXISTS car_rental
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE car_rental;

-- Vehicles available for rent.
CREATE TABLE IF NOT EXISTS cars (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)   NOT NULL,
  brand         VARCHAR(80)    NOT NULL,
  category      VARCHAR(40)    NOT NULL,       -- Economy, SUV, Luxury, Sports, Electric, Van
  price_per_day DECIMAL(10, 2) NOT NULL,
  seats         TINYINT        NOT NULL DEFAULT 5,
  transmission  VARCHAR(20)    NOT NULL DEFAULT 'Automatic',
  fuel          VARCHAR(20)    NOT NULL DEFAULT 'Petrol',
  rating        DECIMAL(2, 1)  NOT NULL DEFAULT 4.5,
  image_url     VARCHAR(500)   NOT NULL,
  description   TEXT,
  available     TINYINT(1)     NOT NULL DEFAULT 1,
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- Customer bookings.
CREATE TABLE IF NOT EXISTS bookings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  car_id         INT            NOT NULL,
  customer_name  VARCHAR(120)   NOT NULL,
  email          VARCHAR(160)   NOT NULL,
  phone          VARCHAR(40)    NOT NULL,
  pickup_location VARCHAR(160)  NOT NULL,
  start_date     DATE           NOT NULL,
  end_date       DATE           NOT NULL,
  days           INT            NOT NULL,
  total_price    DECIMAL(10, 2) NOT NULL,
  status         VARCHAR(20)    NOT NULL DEFAULT 'confirmed',
  created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_car FOREIGN KEY (car_id) REFERENCES cars(id)
);
