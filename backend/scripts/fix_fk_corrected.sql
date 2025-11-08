-- CORRECTED: Foreign key constraints with proper column names
-- The employee table uses 'employee_id' (snake_case) not 'employeeId' (camelCase)

-- Add new foreign key for compensation
ALTER TABLE `compensation` 
ADD CONSTRAINT `FK_compensation_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add new foreign key for employment
ALTER TABLE `employment` 
ADD CONSTRAINT `FK_employment_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Add new foreign key for contact
ALTER TABLE `contact` 
ADD CONSTRAINT `FK_contact_employee` 
FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Verify the new foreign keys
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND TABLE_NAME IN ('compensation', 'employment', 'contact')
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Optional: Drop the old 'employees' table
DROP TABLE IF EXISTS `employees`;
