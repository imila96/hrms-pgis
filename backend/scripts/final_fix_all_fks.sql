-- Final fix for ALL remaining foreign keys to 'employees' table

-- Fix contact_info
ALTER TABLE `contact_info` DROP FOREIGN KEY `FKsd4b2ivofcwl4p5t9l3cvb8mb`;
ALTER TABLE `contact_info` 
ADD CONSTRAINT `FK_contact_info_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Fix employment_info
ALTER TABLE `employment_info` DROP FOREIGN KEY `FKqpiqxlg7uk8acqrwt9775hfdv`;
ALTER TABLE `employment_info` 
ADD CONSTRAINT `FK_employment_info_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Check if any more tables still reference 'employees'
SELECT TABLE_NAME, CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME = 'employees';

-- If the query above returns nothing, drop the old 'employees' table
DROP TABLE IF EXISTS `employees`;

-- Verify all tables now correctly reference 'employee' (singular)
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME IN ('employee', 'employees')
ORDER BY REFERENCED_TABLE_NAME, TABLE_NAME;
