-- Migration script to change from bidirectional to unidirectional relationship
-- From: Employee @MapsId with User (bidirectional)
-- To: User has FK to Employee (unidirectional: User -> Employee)

-- Step 1: Add employee_id column to user_auth table if it doesn't exist
ALTER TABLE user_auth 
ADD COLUMN IF NOT EXISTS employee_id INTEGER;

-- Step 2: Migrate existing data
-- For existing users with employee records, link them together
-- This assumes that employee_id = user_id in the old schema
UPDATE user_auth u
SET employee_id = e.employee_id
FROM employee e
WHERE e.employee_id = u.user_id
AND u.employee_id IS NULL;

-- Step 3: Make employee_id auto-increment in employee table
-- First, check if sequence exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'employee_employee_id_seq') THEN
        CREATE SEQUENCE employee_employee_id_seq;
        -- Set sequence to start from max existing ID + 1
        PERFORM setval('employee_employee_id_seq', COALESCE((SELECT MAX(employee_id) FROM employee), 0) + 1, false);
    END IF;
END $$;

-- Step 4: Update employee table to use sequence for employee_id
ALTER TABLE employee 
ALTER COLUMN employee_id SET DEFAULT nextval('employee_employee_id_seq');

-- Step 5: Add foreign key constraint from user_auth to employee
ALTER TABLE user_auth
ADD CONSTRAINT fk_user_employee 
FOREIGN KEY (employee_id) 
REFERENCES employee(employee_id)
ON DELETE SET NULL;

-- Step 6: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_employee_id ON user_auth(employee_id);

-- Note: Employees can now exist WITHOUT a user account (HR creates employee first)
-- Later, Admin creates user and links to existing employee via employee_id FK

COMMENT ON COLUMN user_auth.employee_id IS 'Foreign key to employee table - unidirectional relationship';
COMMENT ON TABLE employee IS 'Employees can exist without user accounts. User accounts link to employees via FK.';
