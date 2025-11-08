-- Safe script: Check what exists first, then fix only what needs fixing

-- Step 1: See what foreign keys currently exist on these tables
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND TABLE_NAME IN ('contact_info', 'employment_info')
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 2: Based on Step 1 results, only drop the ones that exist
-- For employment_info (if FKqpiqxlg7uk8acqrwt9775hfdv exists):
ALTER TABLE `employment_info` DROP FOREIGN KEY `FKqpiqxlg7uk8acqrwt9775hfdv`;

-- For contact_info (if FKsd4b2ivofcwl4p5t9l3cvb8mb exists - skip if already done):
-- ALTER TABLE `contact_info` DROP FOREIGN KEY `FKsd4b2ivofcwl4p5t9l3cvb8mb`;

-- Step 3: Add new foreign keys (only for tables that don't already have them)
-- For employment_info:
ALTER TABLE `employment_info` 
ADD CONSTRAINT `FK_employment_info_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- For contact_info (if not already added):
-- ALTER TABLE `contact_info` 
-- ADD CONSTRAINT `FK_contact_info_employee` 
-- FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
-- ON DELETE CASCADE
-- ON UPDATE CASCADE;

-- Step 4: Check if any tables still reference 'employees'
SELECT TABLE_NAME, CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME = 'employees';

-- Step 5: If Step 4 returns nothing, drop 'employees'
DROP TABLE IF EXISTS `employees`;
