-- Migration script to create Compensation, Contact, and Employment tables
-- These tables support the Employee entity with detailed information

USE hrms_pgis;

-- Create Compensation table
CREATE TABLE IF NOT EXISTS compensation (
    compensation_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    bank_name VARCHAR(100),
    branch VARCHAR(100),
    account_no VARCHAR(50),
    tin VARCHAR(50),
    pension_scheme VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    INDEX idx_compensation_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Contact table
CREATE TABLE IF NOT EXISTS contact (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    permanent_address TEXT,
    current_address TEXT,
    mobile_number VARCHAR(20),
    home_telephone VARCHAR(20),
    work_email VARCHAR(100),
    personal_email VARCHAR(100),
    emergency_name VARCHAR(100),
    emergency_relationship VARCHAR(50),
    emergency_phone VARCHAR(20),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    INDEX idx_contact_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Employment table
CREATE TABLE IF NOT EXISTS employment (
    employment_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    job_title VARCHAR(100),
    department VARCHAR(100),
    date_of_joining DATE,
    probation_end_date DATE,
    confirmation_date DATE,
    date_of_retirement DATE,
    employment_status VARCHAR(50),
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
    INDEX idx_employment_employee (employee_id),
    INDEX idx_employment_status (employment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add comments for documentation
ALTER TABLE compensation COMMENT = 'Stores employee compensation and banking details';
ALTER TABLE contact COMMENT = 'Stores employee contact and emergency information';
ALTER TABLE employment COMMENT = 'Stores employee job title, department, and employment dates';

-- Note: Make sure to backup your database before running this script
