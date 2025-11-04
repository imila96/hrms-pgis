-- Migration script to update Employee table for SSE role
-- This script removes old fields and adds new SSE-specific fields

USE hrms_pgis;

-- Add new columns for SSE
ALTER TABLE employee 
ADD COLUMN gender VARCHAR(20),
ADD COLUMN date_of_birth DATE,
ADD COLUMN nationality VARCHAR(50),
ADD COLUMN nic_no VARCHAR(20),
ADD COLUMN marital_status VARCHAR(20),
ADD COLUMN religion VARCHAR(50),
ADD COLUMN blood_group VARCHAR(10),
ADD COLUMN profile_image VARCHAR(255);

-- Drop old columns that are no longer needed
ALTER TABLE employee 
DROP COLUMN contact,
DROP COLUMN address,
DROP COLUMN job_title,
DROP COLUMN hire_date,
DROP COLUMN department;

-- Optional: Add indexes for frequently queried fields
CREATE INDEX idx_employee_nic_no ON employee(nic_no);
CREATE INDEX idx_employee_gender ON employee(gender);

-- Note: Make sure to backup your database before running this script
-- If you need to preserve old data, consider exporting it first
