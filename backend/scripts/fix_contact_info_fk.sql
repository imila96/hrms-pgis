-- Fix the contact_info table foreign key constraint

-- Step 1: Drop the old foreign key from contact_info
ALTER TABLE `contact_info` DROP FOREIGN KEY `FKsd4b2ivofcwl4p5t9l3cvb8mb`;

-- Step 2: Add new foreign key pointing to 'employee' (singular)
ALTER TABLE `contact_info` 
ADD CONSTRAINT `FK_contact_info_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Step 3: Check if there are any other tables with foreign keys to 'employees'
-- Run this query to find any remaining references:
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME = 'employees';

-- Step 4: Now drop the 'employees' table
DROP TABLE IF EXISTS `employees`;
