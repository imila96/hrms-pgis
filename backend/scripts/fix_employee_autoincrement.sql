-- Simple fix to make employee_id AUTO_INCREMENT
-- The schema is already correct from Hibernate, we just need AUTO_INCREMENT

USE hrms_dev;

-- Step 1: Check current max employee_id
SELECT MAX(employee_id) AS current_max_id FROM employee;

-- Step 2: Drop the foreign key temporarily
ALTER TABLE `user_auth` DROP FOREIGN KEY `FKitsm2ptg0vy9us4fn3s5r1y3u`;

-- Step 3: Create backup
CREATE TABLE IF NOT EXISTS `employee_backup_nov2` AS SELECT * FROM `employee`;

-- Step 4: Recreate employee table with AUTO_INCREMENT
CREATE TABLE `employee_new` (
  `employee_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_title` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Copy data
INSERT INTO `employee_new` 
SELECT * FROM `employee`;

-- Step 6: Set AUTO_INCREMENT to next value
SET @max_id = (SELECT IFNULL(MAX(employee_id), 0) + 1 FROM `employee_new`);
SET @sql = CONCAT('ALTER TABLE `employee_new` AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 7: Swap tables (disable foreign key checks temporarily)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE `employee`;
RENAME TABLE `employee_new` TO `employee`;
SET FOREIGN_KEY_CHECKS = 1;

-- Step 8: Recreate the foreign key
ALTER TABLE `user_auth`
ADD CONSTRAINT `fk_user_employee` 
FOREIGN KEY (`employee_id`) 
REFERENCES `employee`(`employee_id`)
ON DELETE SET NULL;

-- Step 9: Drop the old unique constraint if it exists (MySQL 8 syntax)
SET @index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND INDEX_NAME = 'UKnv27u6f0rbb05l4vn4ymbtums'
);

SET @drop_index = IF(
    @index_exists > 0,
    'ALTER TABLE `user_auth` DROP INDEX `UKnv27u6f0rbb05l4vn4ymbtums`',
    'SELECT "Index does not exist" AS message'
);

PREPARE stmt FROM @drop_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 10: Verify
SELECT 'Migration completed!' AS status;
SHOW CREATE TABLE employee;
SELECT CONCAT('Next employee_id will be: ', @max_id) AS info;
