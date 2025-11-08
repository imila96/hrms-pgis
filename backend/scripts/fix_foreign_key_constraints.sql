-- Script to fix foreign key constraints pointing to wrong table
-- The constraints are pointing to 'employees' (plural) but should point to 'employee' (singular)

-- Step 1: First, let's find all existing foreign keys
-- Run this query to see all foreign key constraint names:
-- SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME 
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = 'hrms_dev' AND REFERENCED_TABLE_NAME IN ('employee', 'employees');

-- Step 2: Drop existing foreign key constraints (already done for compensation)
-- ALTER TABLE `compensation` DROP FOREIGN KEY `FKhg6u86l6s7nck2s5aiiko3tp1`;

-- Check if employment table has a foreign key (uncomment and run with correct constraint name):
-- ALTER TABLE `employment` DROP FOREIGN KEY `<actual_constraint_name>`;

-- Check if contact table has a foreign key (uncomment and run with correct constraint name):
-- ALTER TABLE `contact` DROP FOREIGN KEY `<actual_constraint_name>`;

-- Step 3: Recreate foreign key constraints pointing to correct table 'employee'
ALTER TABLE `compensation` 
ADD CONSTRAINT `FK_compensation_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `employment` 
ADD CONSTRAINT `FK_employment_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE `contact` 
ADD CONSTRAINT `FK_contact_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Step 4: Now you can safely drop the 'employees' table if needed
-- DROP TABLE IF EXISTS `employees`;
