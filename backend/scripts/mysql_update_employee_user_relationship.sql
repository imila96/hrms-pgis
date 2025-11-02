-- MySQL Migration Script
-- Change from bidirectional (Employee FK to User) to unidirectional (User FK to Employee)
-- 
-- IMPORTANT: Backup your database before running this script!
-- 
-- Usage: 
-- mysql -u root -p hrms_dev < mysql_update_employee_user_relationship.sql

USE hrms_dev;

-- Step 1: Drop existing foreign key constraint from employee to user_auth
ALTER TABLE `employee` 
DROP FOREIGN KEY `fk_emp_user`;

-- Step 2: Make employee_id auto-increment and independent
ALTER TABLE `employee` 
MODIFY `employee_id` INT NOT NULL AUTO_INCREMENT;

-- Step 3: Add email column to employee table if it doesn't exist
-- (Check if column exists first)
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hrms_dev' 
    AND TABLE_NAME = 'employee' 
    AND COLUMN_NAME = 'email'
);

SET @query = IF(
    @col_exists = 0,
    'ALTER TABLE `employee` ADD COLUMN `email` VARCHAR(255) NULL AFTER `hire_date`',
    'SELECT "Column email already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add department column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hrms_dev' 
    AND TABLE_NAME = 'employee' 
    AND COLUMN_NAME = 'department'
);

SET @query = IF(
    @col_exists = 0,
    'ALTER TABLE `employee` ADD COLUMN `department` VARCHAR(100) NULL',
    'SELECT "Column department already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Add employee_id column to user_auth table
ALTER TABLE `user_auth` 
ADD COLUMN `employee_id` INT NULL AFTER `password_changed_at`;

-- Step 6: Migrate existing data
-- For existing users with employee records, link them together
-- Old schema: employee.employee_id = user.user_id
-- New schema: user.employee_id = employee.employee_id
UPDATE `user_auth` u
INNER JOIN `employee` e ON e.employee_id = u.user_id
SET u.employee_id = e.employee_id
WHERE u.employee_id IS NULL;

-- Step 7: Add foreign key constraint from user_auth to employee
ALTER TABLE `user_auth`
ADD CONSTRAINT `fk_user_employee` 
FOREIGN KEY (`employee_id`) 
REFERENCES `employee`(`employee_id`)
ON DELETE SET NULL;

-- Step 8: Add index for better query performance
CREATE INDEX `idx_user_employee_id` ON `user_auth`(`employee_id`);

-- Step 9: Verify the changes
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_employees FROM `employee`;
SELECT COUNT(*) AS users_with_employees FROM `user_auth` WHERE employee_id IS NOT NULL;

-- Show the new structure
SHOW CREATE TABLE `employee`;
SHOW CREATE TABLE `user_auth`;
