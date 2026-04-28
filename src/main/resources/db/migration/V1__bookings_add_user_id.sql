-- Align `bookings` with Booking.user (@JoinColumn user_id -> users.user_id).
-- If this fails on MODIFY (NOT NULL), the table has rows: set user_id first, e.g.
--   UPDATE bookings SET user_id = <valid_users.user_id> WHERE user_id IS NULL;

ALTER TABLE bookings ADD COLUMN user_id INT NULL;

ALTER TABLE bookings MODIFY COLUMN user_id INT NOT NULL;

ALTER TABLE bookings
    ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (user_id);
