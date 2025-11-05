-- ============================================================================
-- Migration: Add employee_id column to user_auth table
-- ============================================================================
-- This script adds the employee_id foreign key column to user_auth table
-- to properly link users with their employee records
-- ============================================================================

USE hrms_dev;

-- Step 1: Add employee_id column to user_auth if it doesn't exist
ALTER TABLE user_auth 
ADD COLUMN IF NOT EXISTS employee_id INT NULL;

-- Step 2: Add admin_password_assigned column if it doesn't exist
ALTER TABLE user_auth
ADD COLUMN IF NOT EXISTS admin_password_assigned TINYINT(1) NOT NULL DEFAULT 0;

-- Step 3: Migrate existing data
-- For existing users where employee_id = user_id (old schema), link them
UPDATE user_auth u
INNER JOIN employee e ON e.employee_id = u.user_id
SET u.employee_id = e.employee_id
WHERE u.employee_id IS NULL;

-- Step 4: Add foreign key constraint
-- First, check if the constraint already exists
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'hrms_dev'
    AND TABLE_NAME = 'user_auth'
    AND CONSTRAINT_NAME = 'fk_user_employee'
);

-- Add constraint if it doesn't exist
SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE user_auth ADD CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE SET NULL',
    'SELECT ''Constraint fk_user_employee already exists'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_employee_id ON user_auth(employee_id);

-- Show results
SELECT '============================================' AS '';
SELECT 'Migration Completed Successfully!' AS 'STATUS';
SELECT '============================================' AS '';
SELECT 'Checking user-employee relationships:' AS 'INFO';

SELECT 
    u.user_id,
    u.email,
    u.employee_id,
    e.name as employee_name,
    e.job_title,
    GROUP_CONCAT(r.code) as roles
FROM user_auth u
LEFT JOIN employee e ON u.employee_id = e.employee_id
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
GROUP BY u.user_id
ORDER BY u.user_id;

-- Note: Users without employee_id will show NULL in employee columns
-- These users (like pure admins) won't be able to access employee-specific features like leave management
