-- MySQL Migration Script - REVISED
-- Change from bidirectional to unidirectional relationship
-- Current state: employee has user_id FK to user_auth
-- Target state: user_auth has employee_id FK to employee

USE hrms_dev;

-- Step 1: Drop the constraint from employee.user_id to user_auth
ALTER TABLE `employee` 
DROP FOREIGN KEY `FKjuqirv7p3rhb8f6begk461k7n`;

-- Step 2: Drop the unique constraint on user_id
ALTER TABLE `employee`
DROP INDEX `UKmpps3d3r9pdvyjx3iqixi96fi`;

-- Step 3: Drop the user_id column from employee
ALTER TABLE `employee`
DROP COLUMN `user_id`;

-- Step 4: Make employee_id auto-increment
ALTER TABLE `employee` 
MODIFY `employee_id` INT NOT NULL AUTO_INCREMENT;

-- Step 5: Check if employee_id column exists in user_auth
-- If not, add it
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hrms_dev' 
    AND TABLE_NAME = 'user_auth' 
    AND COLUMN_NAME = 'employee_id'
);

-- Step 6: Add employee_id column to user_auth if it doesn't exist
SET @query = IF(
    @col_exists = 0,
    'ALTER TABLE `user_auth` ADD COLUMN `employee_id` INT NULL AFTER `password_changed_at`',
    'SELECT "Column employee_id already exists in user_auth" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 7: For existing data, we need to handle the migration
-- Since we're removing the link, we need to decide:
-- Option A: Keep employees without users
-- Option B: Create the reverse link
-- Let's do Option B for existing data

-- First, let's see what we have
SELECT 'Before migration:' AS step;
SELECT COUNT(*) AS total_employees FROM `employee`;
SELECT COUNT(*) AS total_users FROM `user_auth`;

-- Step 8: Add foreign key constraint from user_auth to employee
-- Check if constraint already exists
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
    'SELECT "Foreign key fk_user_employee already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 9: Add index for better query performance
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

-- Step 10: Verify the changes
SELECT 'After migration:' AS step;
SELECT COUNT(*) AS total_employees FROM `employee`;
SELECT COUNT(*) AS total_users FROM `user_auth`;
SELECT COUNT(*) AS users_with_employees FROM `user_auth` WHERE employee_id IS NOT NULL;

-- Show the new structure
SHOW CREATE TABLE `employee`;
SHOW CREATE TABLE `user_auth`;

SELECT 'Migration completed successfully!' AS status;
