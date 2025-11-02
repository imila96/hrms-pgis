-- Final Simple Migration - Just fix AUTO_INCREMENT
USE hrms_dev;

SELECT 'Starting migration...' AS status;
SELECT MAX(employee_id) AS current_max_id FROM employee;

-- Step 1: Drop FK temporarily
ALTER TABLE `user_auth` DROP FOREIGN KEY `fk_user_employee`;
SELECT 'FK dropped' AS status;

-- Step 2: Drop unique constraint on employee_id
ALTER TABLE `user_auth` DROP INDEX `UKnv27u6f0rbb05l4vn4ymbtums`;
SELECT 'Unique constraint dropped' AS status;

-- Step 3: Backup
CREATE TABLE IF NOT EXISTS `employee_backup_nov2_2025` AS SELECT * FROM `employee`;
SELECT 'Backup created' AS status;

-- Step 4: Create new table with AUTO_INCREMENT
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
SELECT 'New table created' AS status;

-- Step 5: Copy data
INSERT INTO `employee_new` SELECT * FROM `employee`;
SELECT 'Data copied' AS status;

-- Step 6: Set AUTO_INCREMENT
SET @max_id = (SELECT IFNULL(MAX(employee_id), 0) + 1 FROM `employee_new`);
SET @sql = CONCAT('ALTER TABLE `employee_new` AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SELECT CONCAT('AUTO_INCREMENT set to: ', @max_id) AS status;

-- Step 7: Swap tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE `employee`;
RENAME TABLE `employee_new` TO `employee`;
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Tables swapped' AS status;

-- Step 8: Recreate FK without UNIQUE constraint
ALTER TABLE `user_auth`
ADD CONSTRAINT `fk_user_employee` 
FOREIGN KEY (`employee_id`) 
REFERENCES `employee`(`employee_id`)
ON DELETE SET NULL;
SELECT 'FK recreated' AS status;

-- Step 9: Add index (not unique)
CREATE INDEX `idx_user_employee_id` ON `user_auth`(`employee_id`);
SELECT 'Index added' AS status;

-- Verification
SELECT 'MIGRATION COMPLETED!' AS '========= STATUS =========';
SELECT '---Employee table---' AS info;
SHOW CREATE TABLE employee;
SELECT '---Summary---' AS info;
SELECT COUNT(*) AS total_employees FROM employee;
SELECT COUNT(*) AS total_users FROM user_auth;
SELECT COUNT(*) AS users_linked_to_employees FROM user_auth WHERE employee_id IS NOT NULL;
