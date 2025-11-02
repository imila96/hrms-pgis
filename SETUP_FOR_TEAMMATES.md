# Database Migration Guide for Teammates

## Overview
This branch contains changes to the Employee-User relationship in the database. After pulling this branch, you **MUST** run the database migration script.

## What Changed?
- **Before**: Employee and User had bidirectional relationship (complicated)
- **After**: User → Employee unidirectional relationship (cleaner)
- HR can now create employees WITHOUT creating user accounts
- Admin creates users separately and links them to employees

## Setup Instructions

### Step 1: Pull the Branch
```bash
git checkout FrontendTest
git pull origin FrontendTest
```

### Step 2: Run Database Migration

#### Option A: Using MySQL Command Line (Recommended)
```bash
cd backend/scripts
mysql -u hrms_user -p hrms_dev < TEAMMATE_MIGRATION.sql
```
Enter password when prompted: `SuperSecret123!`

#### Option B: Using PowerShell (Windows)
```powershell
cd backend\scripts
Get-Content TEAMMATE_MIGRATION.sql | mysql -h localhost -u hrms_user -pSuperSecret123! hrms_dev
```

#### Option C: Using MySQL Workbench or DBeaver
1. Open MySQL Workbench/DBeaver
2. Connect to `hrms_dev` database
3. Open file: `backend/scripts/TEAMMATE_MIGRATION.sql`
4. Execute the entire script

### Step 3: Verify Migration
Check the output of the migration script. You should see:
```
✓ Migration successful!
✓ Backup table created: employee_backup_migration
✓ You can now start the application
```

### Step 4: Install Dependencies & Run

#### Backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend:
```bash
npm install
npm start
```

## Important Notes

### Database Changes Made:
1. `employee.employee_id` is now AUTO_INCREMENT (was manual before)
2. `user_auth.employee_id` is a FOREIGN KEY to `employee.employee_id`
3. Removed bidirectional mapping complexity
4. Backup created automatically: `employee_backup_migration`

### New Workflow:
1. **HR creates employee** → No user account created automatically
2. **Admin goes to User Management** → Sees "Pending Employee Accounts"
3. **Admin clicks "Create User Account"** → User is created and linked to employee
4. **Employee can now login** → With credentials created by admin

### API Changes:
- New endpoint: `GET /admin/users/pending-employees`
- New endpoint: `POST /admin/users/create-user-for-employee`
- Modified: Employee creation no longer creates users

## Troubleshooting

### Error: "Table employee doesn't exist"
- The migration script failed. Check MySQL error logs
- Restore from backup if needed (see rollback instructions in SQL file)

### Error: "FK constraint fails"
- Run the migration script again (it's idempotent - safe to run multiple times)

### Error: "401 Unauthorized" in frontend
- Clear browser cache and local storage
- Re-login to the application

### Application won't start
- Ensure database migration completed successfully
- Check `mvn clean compile` runs without errors
- Verify database connection in `application.properties`

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
USE hrms_dev;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS employee;
RENAME TABLE employee_backup_migration TO employee;
SET FOREIGN_KEY_CHECKS = 1;
```

Then:
```bash
git checkout main  # or your previous branch
```

## Testing After Migration

### Test 1: HR Creates Employee
1. Login as HR
2. Go to Employee Records
3. Add new employee
4. ✓ No user account should be created

### Test 2: Admin Sees Pending Employees
1. Login as Admin
2. Go to User Management
3. ✓ Should see new employee in "Pending Employee Accounts" section

### Test 3: Admin Creates User
1. Click "Create User Account" for pending employee
2. Enter email and password
3. ✓ User account created and linked to employee

### Test 4: Employee Login
1. Logout
2. Login with new credentials
3. ✓ Should access employee dashboard

## Need Help?

If you encounter any issues:
1. Check the migration script output for errors
2. Verify database connection settings
3. Ensure MySQL version is 8.0+
4. Contact the team lead if migration fails

## Files Modified (for reference)

### Backend:
- `Employee.java` - Removed User reference
- `User.java` - Added FK to Employee
- `EmployeeRepository.java` - Added findEmployeesWithoutUsers()
- `EmployeeServiceImpl.java` - Removed auto user creation
- `AdminUserController.java` - Added pending employees endpoints
- `PendingEmployeeDto.java` - NEW file

### Frontend:
- `UserManagement.js` - Updated to show pending employees

### Database:
- Run `TEAMMATE_MIGRATION.sql` (REQUIRED!)

---

**Migration Script**: `backend/scripts/TEAMMATE_MIGRATION.sql`  
**Date**: November 2, 2025  
**Branch**: FrontendTest
