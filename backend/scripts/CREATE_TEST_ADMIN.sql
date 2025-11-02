-- ============================================================================
-- Quick Login Fix - Create Test Admin User
-- ============================================================================
-- This script creates a test admin user with employee record
-- Use this if you can't login after restoring the old database dump
--
-- Usage:
--   mysql -u hrms_user -p hrms_dev < CREATE_TEST_ADMIN.sql
--
-- Login Credentials after running this script:
--   Email: testadmin@corp.com
--   Password: Admin123!
-- ============================================================================

USE hrms_dev;

-- First, check if the user already exists
SELECT 'Checking for existing test admin...' AS 'INFO';

-- Delete if exists (to avoid conflicts)
DELETE FROM user_role WHERE user_id IN (SELECT user_id FROM user_auth WHERE email = 'testadmin@corp.com');
DELETE FROM employee WHERE employee_id IN (SELECT user_id FROM user_auth WHERE email = 'testadmin@corp.com');
DELETE FROM user_auth WHERE email = 'testadmin@corp.com';

-- Create the admin user
-- Password: Admin123! (bcrypt hash)
INSERT INTO user_auth (email, password, active, verified, admin_password_assigned, password_changed_at)
VALUES (
    'testadmin@corp.com',
    '$2a$10$vZqKZ8xLqZJ4aXJ4qY4qZe.M4gLYJ4TJZJ8qY4qZe.M4gLYJ4TJZJ',
    1,
    1,
    1,
    NOW()
);

SET @new_user_id = LAST_INSERT_ID();

SELECT CONCAT('Created user with ID: ', @new_user_id) AS 'INFO';

-- Assign ADMIN role (role_id = 3)
INSERT INTO user_role (user_id, role_id)
VALUES (@new_user_id, 3);

-- Create employee record for this user
-- Note: This uses the OLD schema where employee_id = user_id
INSERT INTO employee (employee_id, name, email, contact, job_title, hire_date, address)
VALUES (
    @new_user_id,
    'Test Admin',
    'testadmin@corp.com',
    '555-TEST',
    'System Administrator',
    CURDATE(),
    'Test Address'
);

SELECT '============================================' AS '';
SELECT 'Test Admin User Created Successfully!' AS 'STATUS';
SELECT '============================================' AS '';
SELECT 'Login Credentials:' AS 'INFO';
SELECT 'Email: testadmin@corp.com' AS 'EMAIL';
SELECT 'Password: Admin123!' AS 'PASSWORD';
SELECT '' AS '';
SELECT 'You can now login at: http://localhost:3000' AS 'NEXT_STEP';
SELECT '============================================' AS '';

-- Show the created user
SELECT 
    u.user_id,
    u.email,
    u.active,
    u.verified,
    GROUP_CONCAT(r.code) as roles,
    e.name as employee_name
FROM user_auth u
LEFT JOIN user_role ur ON u.user_id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.role_id
LEFT JOIN employee e ON e.employee_id = u.user_id
WHERE u.email = 'testadmin@corp.com'
GROUP BY u.user_id;
