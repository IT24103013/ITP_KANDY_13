-- 1. users Table (Superclass)
CREATE TABLE users (
                       user_id INT AUTO_INCREMENT PRIMARY KEY,
                       full_name VARCHAR(100) NOT NULL,
                       email VARCHAR(100) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       nic VARCHAR(20) UNIQUE NOT NULL,
                       role VARCHAR(20) NOT NULL CHECK (role IN ('Customer', 'Admin')),
                       phone VARCHAR(15) NOT NULL
);

-- 2. admin Table (Subclass)
CREATE TABLE admin (
                       user_id INT PRIMARY KEY,
                       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. customer Table (Subclass)
CREATE TABLE customer (
                          license_url VARCHAR(255),
                          user_id INT PRIMARY KEY,
                          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. promotions Table
CREATE TABLE promotions (
                            promo_id INT AUTO_INCREMENT PRIMARY KEY,
                            code VARCHAR(50) UNIQUE NOT NULL,
                            discount_percent DECIMAL(5,2) NOT NULL,
                            valid_for VARCHAR(100),
                            exp_date DATE NOT NULL,
                            admin_id INT,
                            FOREIGN KEY (admin_id) REFERENCES admin(user_id) ON DELETE SET NULL
);

-- 5. vehicle_rent Table
CREATE TABLE vehicle_rent (
                              vehicle_rent_id INT AUTO_INCREMENT PRIMARY KEY,
                              name VARCHAR(100) NOT NULL,
                              type VARCHAR(50),
                              year YEAR,
                              daily_rate DECIMAL(10,2) NOT NULL,
                              status ENUM('Available', 'Reserved', 'Rented') DEFAULT 'Available',
                              description TEXT,
                              mileage_limit INT,
                              extra_mileage_charge DECIMAL(10,2),
                              avg_fuel_efficiency VARCHAR(50),
                              gear_type VARCHAR(20),
                              seats INT,
                              fuel_type VARCHAR(20),
                              promo_id INT,
                              admin_id INT,
                              FOREIGN KEY (promo_id) REFERENCES promotions(promo_id) ON DELETE SET NULL,
                              FOREIGN KEY (admin_id) REFERENCES admin(user_id) ON DELETE SET NULL
);

-- 6. vehicle_sale Table
CREATE TABLE vehicle_sale (
                              vehicle_sale_id INT AUTO_INCREMENT PRIMARY KEY,
                              name VARCHAR(100) NOT NULL,
                              condition_status VARCHAR(50),
                              year_reg YEAR,
                              yom YEAR,
                              edition VARCHAR(50),
                              scan_report_url VARCHAR(255),
                              status VARCHAR(20) DEFAULT 'Available',
                              brand VARCHAR(50),
                              transmission VARCHAR(20),
                              body_type VARCHAR(50),
                              engine_cap VARCHAR(20),
                              mileage INT,
                              color VARCHAR(20),
                              price DECIMAL(12,2) NOT NULL,
                              description TEXT,
                              promo_id INT,
                              admin_id INT,
                              FOREIGN KEY (promo_id) REFERENCES promotions(promo_id) ON DELETE SET NULL,
                              FOREIGN KEY (admin_id) REFERENCES admin(user_id) ON DELETE SET NULL
);

-- 7. vehicle_images Table
CREATE TABLE vehicle_images (
                                vehicle_img_id INT AUTO_INCREMENT PRIMARY KEY,
                                img_url VARCHAR(255) NOT NULL,
                                vehicle_rent_id INT NULL,
                                vehicle_sale_id INT NULL,
                                FOREIGN KEY (vehicle_rent_id) REFERENCES vehicle_rent(vehicle_rent_id) ON DELETE CASCADE,
                                FOREIGN KEY (vehicle_sale_id) REFERENCES vehicle_sale(vehicle_sale_id) ON DELETE CASCADE
);

-- 8. bookings Table
CREATE TABLE bookings (
                          booking_id INT AUTO_INCREMENT PRIMARY KEY,
                          total_cost DECIMAL(10,2) NOT NULL,
                          booking_status ENUM('Pending Payment', 'Confirmed', 'Cancelled') DEFAULT 'Pending Payment',
                          start_date DATE NOT NULL,
                          end_date DATE NOT NULL,
                          customer_id INT,
                          vehicle_rent_id INT,
                          promo_id INT NULL,
                          admin_id INT,
                          FOREIGN KEY (customer_id) REFERENCES customer(user_id) ON DELETE CASCADE,
                          FOREIGN KEY (vehicle_rent_id) REFERENCES vehicle_rent(vehicle_rent_id) ON DELETE CASCADE,
                          FOREIGN KEY (promo_id) REFERENCES promotions(promo_id) ON DELETE SET NULL,
                          FOREIGN KEY (admin_id) REFERENCES admin(user_id) ON DELETE SET NULL
);

-- 9. payments Table
CREATE TABLE payments (
                          payment_id INT AUTO_INCREMENT PRIMARY KEY,
                          status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                          bank_slip_url VARCHAR(255),
                          amount DECIMAL(10,2) NOT NULL,
                          remarks TEXT,
                          payment_date DATE,
                          booking_id INT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- 10. reviews Table
CREATE TABLE reviews (
                         review_id INT AUTO_INCREMENT PRIMARY KEY,
                         stars INT CHECK (stars >= 1 AND stars <= 5),
                         comment TEXT,
                         customer_id INT,
                         vehicle_rent_id INT NULL,
                         vehicle_sale_id INT NULL,
                         FOREIGN KEY (customer_id) REFERENCES customer(user_id) ON DELETE CASCADE,
                         FOREIGN KEY (vehicle_rent_id) REFERENCES vehicle_rent(vehicle_rent_id) ON DELETE CASCADE,
                         FOREIGN KEY (vehicle_sale_id) REFERENCES vehicle_sale(vehicle_sale_id) ON DELETE CASCADE
);

-- 11. inquiries Table
CREATE TABLE inquiries (
                           inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
                           status VARCHAR(20) DEFAULT 'Unread',
                           message TEXT NOT NULL,
                           admin_reply TEXT,
                           inquiry_type VARCHAR(50),
                           customer_id INT,
                           vehicle_sale_id INT NULL,
                           admin_id INT NULL,
                           FOREIGN KEY (customer_id) REFERENCES customer(user_id) ON DELETE CASCADE,
                           FOREIGN KEY (vehicle_sale_id) REFERENCES vehicle_sale(vehicle_sale_id) ON DELETE CASCADE,
                           FOREIGN KEY (admin_id) REFERENCES admin(user_id) ON DELETE SET NULL
);

-- 12. Notification
CREATE TABLE notifications (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               message VARCHAR(500) NOT NULL,
                               type VARCHAR(50) NOT NULL,
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at DATETIME NOT NULL,
                               user_id INT NULL
);


-- 1. (Users & Roles)
SELECT * FROM users;
SELECT * FROM admin;
SELECT * FROM customer;

-- 2. (Promotions)
SELECT * FROM promotions;

-- 3. (Vehicles & Images)
SELECT * FROM vehicle_rent;
SELECT * FROM vehicle_sale;
SELECT * FROM vehicle_images;

-- 4. (Bookings & Payments)
SELECT * FROM bookings;
SELECT * FROM payments;

-- 5. (Feedback & Support)
SELECT * FROM reviews;
SELECT * FROM inquiries;
SELECT * FROM notifications;

-- 1. Users
INSERT INTO users (full_name, email, password, nic, role, phone) VALUES
                                                                     ('Admin1', 'admin@samarasinghemotors.lk', 'admin123', '901234567V', 'Admin', '0719876543'),
                                                                     ('Kasun Perera', 'kasun.p@gmail.com', 'kasun123', '921234567V', 'Customer', '0774567890'),
                                                                     ('Nimali Silva', 'nimali.s@yahoo.com', 'nimali123', '951234567V', 'Customer', '0751122334'),
                                                                     ('Ruwan Bandara', 'ruwan.b@gmail.com', 'ruwan123', '881234567V', 'Customer', '0789988776');

-- 2. Admin
INSERT INTO admin (user_id) VALUES (1);

-- 3. Customer
INSERT INTO customer (user_id, license_url) VALUES
                                                (2, 'https://example.com/license/kasun.jpg'),
                                                (3, 'https://example.com/license/nimali.jpg'),
                                                (4, 'https://example.com/license/ruwan.jpg');

-- 1. Suzuki Alto
INSERT INTO vehicle_rent (name, type, year, daily_rate, status, description, mileage_limit, extra_mileage_charge, avg_fuel_efficiency, gear_type, seats, fuel_type, admin_id)
VALUES ('Suzuki Alto', 'Hatchback', 2018, 5000.00, 'Available', 'Economical car for city rides. Good condition.', 100, 50.00, '18 km/l', 'Manual', 4, 'Petrol', 1);

SET @alto_id = LAST_INSERT_ID();

INSERT INTO vehicle_images (img_url, vehicle_rent_id)
VALUES ('/images/alto.png', @alto_id);


-- 2. Toyota Premio
INSERT INTO vehicle_rent (name, type, year, daily_rate, status, description, mileage_limit, extra_mileage_charge, avg_fuel_efficiency, gear_type, seats, fuel_type, admin_id)
VALUES ('Toyota Premio', 'Sedan', 2019, 15000.00, 'Available', 'Luxury and comfortable sedan for long trips.', 100, 100.00, '12 km/l', 'Auto', 5, 'Petrol', 1);

SET @premio_id = LAST_INSERT_ID();

INSERT INTO vehicle_images (img_url, vehicle_rent_id)
VALUES ('/images/premio.png', @premio_id);


-- 3. Toyota KDH Van
INSERT INTO vehicle_rent (name, type, year, daily_rate, status, description, mileage_limit, extra_mileage_charge, avg_fuel_efficiency, gear_type, seats, fuel_type, admin_id)
VALUES ('Toyota KDH Van', 'Van', 2016, 25000.00, 'Reserved', 'Spacious van for family trips and tours.', 150, 150.00, '10 km/l', 'Manual', 12, 'Diesel', 1);

SET @kdh_id = LAST_INSERT_ID();

INSERT INTO vehicle_images (img_url, vehicle_rent_id)
VALUES ('/images/ToyotaKDH.png', @kdh_id);


-- 4. Suzuki Wagon R
INSERT INTO vehicle_rent (name, type, year, daily_rate, status, description, mileage_limit, extra_mileage_charge, avg_fuel_efficiency, gear_type, seats, fuel_type, admin_id)
VALUES ('Suzuki Wagon R', 'Hatchback', 2017, 8000.00, 'Rented', 'Hybrid car with excellent fuel efficiency.', 100, 60.00, '20 km/l', 'Auto', 4, 'Hybrid', 1);

SET @wagon_r_id = LAST_INSERT_ID();

INSERT INTO vehicle_images (img_url, vehicle_rent_id)
VALUES ('/images/SuzukiWagonR.png', @wagon_r_id);


-- 5. Honda Vezel
INSERT INTO vehicle_rent (name, type, year, daily_rate, status, description, mileage_limit, extra_mileage_charge, avg_fuel_efficiency, gear_type, seats, fuel_type, admin_id)
VALUES ('Honda Vezel', 'SUV', 2018, 12000.00, 'Available', 'Compact SUV for all terrains. High comfort.', 100, 120.00, '15 km/l', 'Auto', 5, 'Hybrid', 1);

SET @vezel_id = LAST_INSERT_ID();

INSERT INTO vehicle_images (img_url, vehicle_rent_id)
VALUES ('/images/vezel.png', @vezel_id);




-- Payments
DELETE FROM payments;

-- Bookings
DELETE FROM bookings;

--
DELETE FROM vehicle_rent;

UPDATE vehicle_rent SET status = 'Available' ;



-- add created-at
ALTER TABLE bookings ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;


CREATE TABLE password_reset_tokens (
                                       id INT AUTO_INCREMENT PRIMARY KEY,
                                       token VARCHAR(255) NOT NULL UNIQUE,
                                       user_id INT NOT NULL,
                                       expiry_date DATETIME NOT NULL,
                                       CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

select * from password_reset_tokens;









