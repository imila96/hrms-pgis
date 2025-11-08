-- Final verification: Check all foreign keys now point to 'employee' (singular)
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'hrms_dev' 
AND REFERENCED_TABLE_NAME IN ('employee', 'employees')
ORDER BY REFERENCED_TABLE_NAME, TABLE_NAME;

-- This should show:
-- - All foreign keys pointing to 'employee' (singular)
-- - NO foreign keys pointing to 'employees' (plural)
