-- Quick fix: Auto-link all users to employees by email match
-- Run this in your MySQL database

UPDATE user_auth u
INNER JOIN employee e ON u.email = e.email
SET u.employee_id = e.employeeId
WHERE u.employee_id IS NULL;

-- Verify the changes
SELECT 
    u.user_id,
    u.email,
    u.employee_id,
    e.name AS employee_name
FROM user_auth u
LEFT JOIN employee e ON u.employee_id = e.employeeId;
