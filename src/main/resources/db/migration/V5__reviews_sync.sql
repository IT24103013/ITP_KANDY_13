-- Sync reviews table with Review entity
ALTER TABLE reviews ADD COLUMN rating INT NOT NULL DEFAULT 0;
UPDATE reviews SET rating = stars WHERE stars IS NOT NULL;

ALTER TABLE reviews ADD COLUMN review_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
