-- Safe sync for promotions table with Promotion entity
DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(64),
    IN colName VARCHAR(64),
    IN colDef VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = tableName 
        AND column_name = colName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', colName, ' ', colDef);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL AddColumnIfNotExists('promotions', 'promo_name', 'VARCHAR(100) NOT NULL DEFAULT \'\'');
CALL AddColumnIfNotExists('promotions', 'discount_rate', 'DECIMAL(5,2) NOT NULL DEFAULT 0.00');
CALL AddColumnIfNotExists('promotions', 'start_date', 'DATE NOT NULL DEFAULT (CURRENT_DATE)');
CALL AddColumnIfNotExists('promotions', 'end_date', 'DATE NOT NULL DEFAULT (CURRENT_DATE)');

DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

-- Data migration if needed (can be run multiple times safely)
UPDATE promotions SET discount_rate = discount_percent WHERE discount_percent IS NOT NULL AND discount_rate = 0.00;
UPDATE promotions SET end_date = exp_date WHERE exp_date IS NOT NULL;
