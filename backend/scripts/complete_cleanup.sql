-- Complete cleanup script to fix all foreign keys and drop 'employees' table

-- Step 1: Find all foreign keys pointing to 'employees' (the wrong table)
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME = 'employees';

-- Step 2: Drop foreign keys from contact_info (and any other tables found above)
ALTER TABLE `contact_info` DROP FOREIGN KEY `FKsd4b2ivofcwl4p5t9l3cvb8mb`;

-- Add more DROP statements here if Step 1 found other tables
-- ALTER TABLE `other_table` DROP FOREIGN KEY `constraint_name_from_step1`;

-- Step 3: Add correct foreign keys pointing to 'employee' table
-- (Skip if already exists - compensation, employment, contact already have them)

-- For contact_info
ALTER TABLE `contact_info` 
ADD CONSTRAINT `FK_contact_info_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add constraints for any other tables found in Step 1
-- ALTER TABLE `other_table` 
-- ADD CONSTRAINT `FK_other_table_employee` 
-- FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
-- ON DELETE CASCADE
-- ON UPDATE CASCADE;

-- Step 4: Verify no more foreign keys point to 'employees'
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME = 'employees';

-- Step 5: If Step 4 returns no results, drop the 'employees' table
DROP TABLE IF EXISTS `employees`;

-- Step 6: Verify all foreign keys now point to 'employee' (singular)
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME = 'employee';
