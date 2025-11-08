-- Step-by-step fix for foreign key constraints
-- Execute these one by one

-- STEP 1: Find all existing foreign key constraints
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND TABLE_NAME IN ('compensation', 'employment', 'contact');

-- STEP 2: Drop existing foreign keys (if they exist)
-- For compensation (already done)
-- ALTER TABLE `compensation` DROP FOREIGN KEY `FKhg6u86l6s7nck2s5aiiko3tp1`;

-- For employment - check the output from STEP 1 first, then uncomment with correct name:
-- ALTER TABLE `employment` DROP FOREIGN KEY `<constraint_name_from_step1>`;

-- For contact - check the output from STEP 1 first, then uncomment with correct name:
-- ALTER TABLE `contact` DROP FOREIGN KEY `<constraint_name_from_step1>`;

-- STEP 3: Add new foreign keys pointing to 'employee' table
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

-- STEP 4: Verify the new foreign keys
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND TABLE_NAME IN ('compensation', 'employment', 'contact')
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- STEP 5: Drop the old 'employees' table (optional)
-- DROP TABLE IF EXISTS `employees`;
