-- Add medical certificate BLOB field to leave_application table
-- This allows storing medical certificates for sick leaves > 2 days

ALTER TABLE leave_application
ADD COLUMN medical_certificate LONGBLOB COMMENT 'Medical certificate for sick leaves exceeding 2 days';

ALTER TABLE leave_application
ADD COLUMN medical_certificate_filename VARCHAR(255) COMMENT 'Original filename of the medical certificate';

ALTER TABLE leave_application
ADD COLUMN medical_certificate_content_type VARCHAR(100) COMMENT 'MIME type of the medical certificate';

-- Remove the old medicalDocUrl column if not used
-- ALTER TABLE leave_application DROP COLUMN medicalDocUrl;
