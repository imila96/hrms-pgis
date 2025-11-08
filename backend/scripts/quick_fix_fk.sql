-- Quick fix for foreign key constraints
-- Run this to fix the issue immediately

USE hrms_dev;

-- Step 1: Check what foreign keys exist pointing to 'employees'
SELECT CONSTRAINT_NAME, TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_NAME = 'employees' 
AND TABLE_SCHEMA = 'hrms_dev';

-- Step 2: Drop the problematic foreign key from compensation
ALTER TABLE `compensation` DROP FOREIGN KEY `FKhg6u86l6s7nck2s5aiiko3tp1`;

-- Step 3: Add correct foreign key pointing to 'employee' table
ALTER TABLE `compensation` 
ADD CONSTRAINT `FK_compensation_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 4: Check if employment and contact tables also have issues
-- If they do, fix them similarly:

-- For employment table (run this if it has FK to 'employees'):
-- ALTER TABLE `employment` DROP FOREIGN KEY `<constraint_name_here>`;
-- ALTER TABLE `employment` 
-- ADD CONSTRAINT `FK_employment_employee` 
-- FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`) 
-- ON DELETE CASCADE 
-- ON UPDATE CASCADE;

-- For contact table (run this if it has FK to 'employees'):
-- ALTER TABLE `contact` DROP FOREIGN KEY `<constraint_name_here>`;
-- ALTER TABLE `contact` 
-- ADD CONSTRAINT `FK_contact_employee` 
-- FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employeeId`) 
-- ON DELETE CASCADE 
-- ON UPDATE CASCADE;

-- Step 5: After fixing all foreign keys, you can drop the 'employees' table
-- DROP TABLE IF EXISTS `employees`;
