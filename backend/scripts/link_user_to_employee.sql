-- ============================================
-- Link User Accounts to Employee Records
-- ============================================
-- This script helps link user_auth records to employee records
-- Run this to fix the "User.getEmployee() is null" error

-- Step 1: View current users without employees
SELECT 'Current users WITHOUT employee link:' AS status;
SELECT 
    u.user_id,
    u.email,
    u.employee_id,
    GROUP_CONCAT(r.name) AS roles
FROM user_auth u
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
WHERE u.employee_id IS NULL
GROUP BY u.user_id, u.email, u.employee_id;

-- Step 2: View available employees
SELECT '
Available employees:' AS status;
SELECT 
    e.employeeId,
    e.name,
    e.email,
    ua.user_id AS linked_user_id
FROM employee e
LEFT JOIN user_auth ua ON e.employeeId = ua.employee_id
ORDER BY e.employeeId;

-- Step 3: AUTO-LINK users to employees by matching email
SELECT '
Auto-linking users to employees by email match...' AS status;

UPDATE user_auth u
INNER JOIN employee e ON u.email = e.email
SET u.employee_id = e.employeeId
WHERE u.employee_id IS NULL 
  AND e.email IS NOT NULL 
  AND e.email != '';

SELECT ROW_COUNT() AS users_auto_linked;

-- Step 4: Show results
SELECT '
Users successfully linked:' AS status;
SELECT 
    u.user_id,
    u.email,
    u.employee_id,
    e.name AS employee_name,
    e.jobTitle AS job_title,
    GROUP_CONCAT(r.name) AS roles
FROM user_auth u
INNER JOIN employee e ON u.employee_id = e.employeeId
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
GROUP BY u.user_id, u.email, u.employee_id, e.name, e.jobTitle;

-- Step 5: Still unlinked?
SELECT '
Users still WITHOUT employee link:' AS status;
SELECT 
    u.user_id,
    u.email,
    u.employee_id,
    'MANUAL FIX NEEDED' AS action
FROM user_auth u
WHERE u.employee_id IS NULL;

-- ============================================
-- MANUAL LINKING (if auto-link didn't work)
-- ============================================
-- If your user email doesn't match any employee email, 
-- you need to manually link them:

-- Example: Link user_id 1 to employee_id 14
-- UPDATE user_auth SET employee_id = 14 WHERE user_id = 1;

-- To find your user_id:
-- SELECT user_id, email FROM user_auth WHERE email = 'your.email@example.com';

-- To find available employees:
-- SELECT employeeId, name, email FROM employee;

-- Then run:
-- UPDATE user_auth SET employee_id = [EMPLOYEE_ID] WHERE user_id = [USER_ID];
