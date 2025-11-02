-- ============================================================================
-- HRMS Database Migration Script
-- ============================================================================
-- Purpose: Change Employee-User relationship from bidirectional to unidirectional
-- Date: November 2, 2025
-- Branch: FrontendTest
-- 
-- IMPORTANT: 
-- 1. Backup your database before running this script!
-- 2. This script is idempotent - safe to run multiple times
-- 3. Compatible with MySQL 8.0+
--
-- Usage:
-- Method 1 (Command line):
--   mysql -u hrms_user -p hrms_dev < TEAMMATE_MIGRATION.sql
--
-- Method 2 (MySQL Workbench/DBeaver):
--   Open this file and execute all statements
--
-- Method 3 (PowerShell - Windows):
--   Get-Content TEAMMATE_MIGRATION.sql | mysql -h localhost -u hrms_user -pYourPassword hrms_dev
-- ============================================================================

USE hrms_dev;

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- ============================================================================
-- STEP 1: Check if migration is needed
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'HRMS Database Migration - Starting...' AS 'STATUS';
SELECT '============================================' AS '';

-- Show current state
SELECT 'Current employee table structure:' AS 'INFO';
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND TABLE_NAME = 'employee'
ORDER BY ORDINAL_POSITION;

-- ============================================================================
-- STEP 2: Backup existing employee data
-- ============================================================================
SELECT 'Creating backup table...' AS 'INFO';

DROP TABLE IF EXISTS `employee_backup_migration`;
CREATE TABLE `employee_backup_migration` AS SELECT * FROM `employee`;

SELECT CONCAT('Backed up ', COUNT(*), ' employee records') AS 'BACKUP' 
FROM `employee_backup_migration`;

-- ============================================================================
-- STEP 3: Drop foreign keys and constraints
-- ============================================================================
SELECT 'Dropping old foreign keys and constraints...' AS 'INFO';

-- Drop FK from user_auth to employee (if exists)
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND CONSTRAINT_NAME = 'fk_user_employee'
);

SET @query = IF(
    @fk_exists > 0,
    'ALTER TABLE `user_auth` DROP FOREIGN KEY `fk_user_employee`',
    'SELECT "FK fk_user_employee does not exist, skipping..." AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop unique constraint on employee_id (if exists)
SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND INDEX_NAME = 'UKnv27u6f0rbb05l4vn4ymbtums'
);

SET @query = IF(
    @idx_exists > 0,
    'ALTER TABLE `user_auth` DROP INDEX `UKnv27u6f0rbb05l4vn4ymbtums`',
    'SELECT "Unique index does not exist, skipping..." AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop old FK constraints from employee table (if any)
SET @fk_list = (
    SELECT GROUP_CONCAT(CONSTRAINT_NAME)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'employee'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

-- This will drop any old FKs
SET @query = IF(
    @fk_list IS NOT NULL,
    CONCAT('ALTER TABLE `employee` ', 
        (SELECT GROUP_CONCAT(CONCAT('DROP FOREIGN KEY `', CONSTRAINT_NAME, '`'))
         FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = 'hrms_dev'
         AND TABLE_NAME = 'employee'
         AND CONSTRAINT_TYPE = 'FOREIGN KEY')),
    'SELECT "No foreign keys to drop from employee table" AS message'
);

SET @has_fks = IF(@fk_list IS NOT NULL, 1, 0);
IF @has_fks = 1 THEN
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END IF;

-- Drop user_id column from employee if it exists
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'employee'
    AND COLUMN_NAME = 'user_id'
);

SET @query = IF(
    @col_exists > 0,
    'ALTER TABLE `employee` DROP COLUMN `user_id`',
    'SELECT "Column user_id does not exist in employee table" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- STEP 4: Recreate employee table with AUTO_INCREMENT
-- ============================================================================
SELECT 'Recreating employee table with AUTO_INCREMENT...' AS 'INFO';

CREATE TABLE `employee_new` (
  `employee_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_title` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copy data from old table
INSERT INTO `employee_new` 
    (employee_id, name, contact, job_title, hire_date, address, email, department)
SELECT 
    employee_id, name, contact, job_title, hire_date, address, email, department
FROM `employee`;

-- Set AUTO_INCREMENT to next value
SET @max_id = (SELECT IFNULL(MAX(employee_id), 0) + 1 FROM `employee_new`);
SET @alter_sql = CONCAT('ALTER TABLE `employee_new` AUTO_INCREMENT = ', @max_id);
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT CONCAT('Next employee_id will be: ', @max_id) AS 'INFO';

-- Swap tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE `employee`;
RENAME TABLE `employee_new` TO `employee`;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- STEP 5: Update user_auth table
-- ============================================================================
SELECT 'Updating user_auth table...' AS 'INFO';

-- Add employee_id column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND COLUMN_NAME = 'employee_id'
);

SET @query = IF(
    @col_exists = 0,
    'ALTER TABLE `user_auth` ADD COLUMN `employee_id` INT NULL AFTER `password_changed_at`',
    'SELECT "Column employee_id already exists in user_auth" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- STEP 6: Add foreign key and indexes
-- ============================================================================
SELECT 'Adding foreign key constraint and indexes...' AS 'INFO';

-- Add FK constraint
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND CONSTRAINT_NAME = 'fk_user_employee'
);

SET @query = IF(
    @fk_exists = 0,
    'ALTER TABLE `user_auth` ADD CONSTRAINT `fk_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee`(`employee_id`) ON DELETE SET NULL',
    'SELECT "FK fk_user_employee already exists" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for performance
SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND INDEX_NAME = 'idx_user_employee_id'
);

SET @query = IF(
    @idx_exists = 0,
    'CREATE INDEX `idx_user_employee_id` ON `user_auth`(`employee_id`)',
    'SELECT "Index idx_user_employee_id already exists" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- STEP 7: Verification
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'MIGRATION COMPLETED!' AS 'STATUS';
SELECT '============================================' AS '';

SELECT 'Final Statistics:' AS 'INFO';
SELECT COUNT(*) AS total_employees FROM `employee`;
SELECT COUNT(*) AS total_users FROM `user_auth`;
SELECT COUNT(*) AS users_with_employee_link FROM `user_auth` WHERE employee_id IS NOT NULL;
SELECT COUNT(*) AS employees_without_users FROM `employee` e 
WHERE NOT EXISTS (SELECT 1 FROM user_auth u WHERE u.employee_id = e.employee_id);

SELECT 'New employee table structure:' AS 'INFO';
SHOW CREATE TABLE `employee`;

SELECT 'Updated user_auth table structure:' AS 'INFO';
SHOW CREATE TABLE `user_auth`;

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

SELECT '============================================' AS '';
SELECT 'Migration successful!' AS 'STATUS';
SELECT 'Backup table created: employee_backup_migration' AS 'INFO';
SELECT 'You can now start the application' AS 'NEXT_STEP';
SELECT '============================================' AS '';

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- If something goes wrong, you can restore from backup:
-- 
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS employee;
-- RENAME TABLE employee_backup_migration TO employee;
-- SET FOREIGN_KEY_CHECKS = 1;
-- 
-- Then revert the code changes in your Git branch
-- ============================================================================
