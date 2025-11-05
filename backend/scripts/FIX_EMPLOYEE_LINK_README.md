# Fix: User Not Linked to Employee

## Problem
When trying to access leave management, you're getting this error:
```
Cannot invoke "Employee.getEmployeeId()" because the return value of "User.getEmployee()" is null
```

## Cause
Your user account in the `user_auth` table is not linked to an employee record in the `employee` table. The `employee_id` column in `user_auth` is NULL.

## Solution

### Option 1: Automatic Fix (Recommended)
Run the batch script that automatically links users to employees by matching email addresses:

**Windows:**
```cmd
cd E:\v2\hrms-pgis
.\backend\scripts\fix_employee_link.bat
```

**PowerShell:**
```powershell
cd E:\v2\hrms-pgis
.\backend\scripts\fix_employee_link.ps1
```

### Option 2: Manual SQL Fix
If the automatic fix doesn't work, you can manually link users to employees:

1. Open MySQL command line or MySQL Workbench
2. Connect to your `hrms_db` database
3. Run this SQL:

```sql
-- Find your user_id
SELECT user_id, email FROM user_auth WHERE email = 'your.email@example.com';

-- Find available employees
SELECT employeeId, name, email FROM employee;

-- Link your user to an employee (replace the IDs)
UPDATE user_auth 
SET employee_id = [EMPLOYEE_ID] 
WHERE user_id = [YOUR_USER_ID];
```

**Example:**
```sql
-- If your user_id is 1 and you want to link to employee 14:
UPDATE user_auth SET employee_id = 14 WHERE user_id = 1;
```

### Option 3: Run Complete Script
For more detailed information and verification:

```bash
cd E:\v2\hrms-pgis\backend\scripts
mysql -u root -p hrms_db < link_user_to_employee.sql
```

## Verification
After running the fix, verify the link worked:

```sql
SELECT 
    u.user_id,
    u.email,
    u.employee_id,
    e.name AS employee_name,
    e.jobTitle
FROM user_auth u
LEFT JOIN employee e ON u.employee_id = e.employeeId
WHERE u.email = 'your.email@example.com';
```

You should see your `employee_id` populated and the `employee_name` showing correctly.

## After Fixing
1. Restart your Spring Boot backend (if running)
2. Refresh your browser
3. Try accessing the Leave Management page again
4. You should now see your leave balances!

## Prevention
When creating new users in the future, always ensure they're linked to an employee record by:
1. Creating an employee record first
2. Then creating a user account with that employee's ID
3. Or linking them immediately after user creation

## Need Help?
If you still have issues after following these steps, check:
- Is your email in `user_auth` the same as in `employee`?
- Does an employee record exist for you?
- Are you logged in with the correct account?
