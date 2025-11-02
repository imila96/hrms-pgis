-- MySQL Migration Script - SAFE VERSION
-- Execute each section ONE AT A TIME and verify results

USE hrms_dev;

-- ============================================
-- SECTION 1: CHECK CURRENT STATE
-- ============================================
SELECT 'CURRENT STATE CHECK' AS '====== STEP ======';
SELECT 'Employee table structure:' AS info;
SHOW CREATE TABLE employee;

SELECT 'User_auth table structure:' AS info;
SHOW CREATE TABLE user_auth;

SELECT 'Employee foreign keys:' AS info;
SELECT 
    CONSTRAINT_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'hrms_dev'
AND TABLE_NAME = 'employee'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ============================================
-- SECTION 2: DROP OLD CONSTRAINTS AND COLUMNS
-- ============================================
SELECT '====== DROPPING OLD CONSTRAINTS ======' AS '====== STEP ======';

-- Drop foreign key constraint (use actual constraint name from SECTION 1)
ALTER TABLE `employee` 
DROP FOREIGN KEY `FKjuqirv7p3rhb8f6begk461k7n`;

-- Drop unique constraint
ALTER TABLE `employee`
DROP INDEX IF EXISTS `UKmpps3d3r9pdvyjx3iqixi96fi`;

-- Drop user_id column
ALTER TABLE `employee`
DROP COLUMN IF EXISTS `user_id`;

SELECT 'Old constraints dropped successfully' AS status;

-- ============================================
-- SECTION 3: RECREATE EMPLOYEE TABLE WITH AUTO_INCREMENT
-- ============================================
SELECT '====== RECREATING EMPLOYEE TABLE ======' AS '====== STEP ======';

-- Create a backup table
CREATE TABLE IF NOT EXISTS `employee_backup` AS SELECT * FROM `employee`;

-- Drop and recreate employee table with AUTO_INCREMENT
DROP TABLE IF EXISTS `employee_temp`;
CREATE TABLE `employee_temp` (
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

-- Copy data from old table to new table
INSERT INTO `employee_temp` 
  (employee_id, name, contact, job_title, hire_date, address, email, department)
SELECT 
  employee_id, name, contact, job_title, hire_date, address, email, department
FROM `employee`;

-- Set the AUTO_INCREMENT value to max(employee_id) + 1
SET @max_id = (SELECT IFNULL(MAX(employee_id), 0) + 1 FROM `employee_temp`);
SET @alter_sql = CONCAT('ALTER TABLE `employee_temp` AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Employee_temp table created with AUTO_INCREMENT' AS status;
SELECT @max_id AS next_employee_id;

-- ============================================
-- SECTION 4: DROP FOREIGN KEY CONSTRAINTS THAT REFERENCE EMPLOYEE
-- ============================================
SELECT '====== HANDLING DEPENDENT TABLES ======' AS '====== STEP ======';

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Swap tables
DROP TABLE `employee`;
RENAME TABLE `employee_temp` TO `employee`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Employee table recreated successfully' AS status;

-- ============================================
-- SECTION 5: ADD EMPLOYEE_ID TO USER_AUTH
-- ============================================
SELECT '====== ADDING EMPLOYEE_ID TO USER_AUTH ======' AS '====== STEP ======';

-- Add employee_id column if it doesn't exist
ALTER TABLE `user_auth` 
ADD COLUMN IF NOT EXISTS `employee_id` INT NULL AFTER `password_changed_at`;

SELECT 'employee_id column added to user_auth' AS status;

-- ============================================
-- SECTION 6: ADD FOREIGN KEY AND INDEX
-- ============================================
SELECT '====== ADDING FOREIGN KEY ======' AS '====== STEP ======';

-- Add foreign key constraint
ALTER TABLE `user_auth`
ADD CONSTRAINT `fk_user_employee` 
FOREIGN KEY (`employee_id`) 
REFERENCES `employee`(`employee_id`)
ON DELETE SET NULL;

-- Add index
CREATE INDEX `idx_user_employee_id` ON `user_auth`(`employee_id`);

SELECT 'Foreign key and index added successfully' AS status;

-- ============================================
-- SECTION 7: VERIFY FINAL STATE
-- ============================================
SELECT '====== FINAL VERIFICATION ======' AS '====== STEP ======';

SELECT 'Employee table structure:' AS info;
SHOW CREATE TABLE employee;

SELECT 'User_auth table structure:' AS info;
SHOW CREATE TABLE user_auth;

SELECT COUNT(*) AS total_employees FROM `employee`;
SELECT COUNT(*) AS total_users FROM `user_auth`;
SELECT COUNT(*) AS users_with_employees FROM `user_auth` WHERE employee_id IS NOT NULL;

SELECT '====== MIGRATION COMPLETED SUCCESSFULLY! ======' AS '====== STEP ======';
