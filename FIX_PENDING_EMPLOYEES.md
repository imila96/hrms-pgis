# Fix: Pending Employee Accounts Workflow

## Problem
When HR creates an employee, it was showing directly in "User Account Management" instead of "Pending Employee Accounts (Need Password)".

## Root Cause
The old workflow assumed:
- HR creates employee → automatically creates user with temp password
- Admin sees users with `adminPasswordAssigned = false` as "pending"

The NEW workflow is:
- HR creates employee WITHOUT creating a user
- Admin should see employees WITHOUT users as "pending"
- Admin creates user account and links to existing employee

## Solution Implemented

### Backend Changes

#### 1. **New Repository Query** (`EmployeeRepository.java`)
Added query to find employees without linked users:
```java
@Query("""
    SELECT e FROM Employee e 
    WHERE NOT EXISTS (
        SELECT 1 FROM User u WHERE u.employee.employeeId = e.employeeId
    )
""")
List<Employee> findEmployeesWithoutUsers();
```

#### 2. **New DTO** (`PendingEmployeeDto.java`)
```java
public record PendingEmployeeDto(
    Integer employeeId,
    String email,
    String name,
    String jobTitle,
    String contact
) {}
```

#### 3. **New Endpoints** (`AdminUserController.java`)

**a) Get Pending Employees:**
```java
@GetMapping("/pending-employees")
public List<PendingEmployeeDto> pendingEmployees()
```
Returns all employees that don't have a user account yet.

**b) Create User for Employee:**
```java
@PostMapping("/create-user-for-employee")
public UserSummary createUserForEmployee(@RequestBody CreateUserForEmployeeRequest r)
```
Creates a user account and links it to an existing employee.

**c) New Request DTO:**
```java
public record CreateUserForEmployeeRequest(
    Integer employeeId,
    @Email String email,
    @Size(min = 6) String password,
    String role
) {}
```

### Frontend Changes

#### **UserManagement.js** - Complete Refactor

**Changed:**
1. **State Variables:**
   - `pending` → `pendingEmployees`
   - Added `userEmail` state for user account creation

2. **API Calls:**
   - Changed from `/admin/users/pending-password` → `/admin/pending-employees`

3. **Table Structure:**
   - Now shows: Employee ID, Name, Email, Position, Contact
   - Button: "Create User Account" instead of "Add User"

4. **Dialog:**
   - Now asks for user email (can be different from employee email)
   - Creates user and links to employee
   - Shows employee info clearly

5. **Function:**
   - `assignInitialPassword()` → `createUserForEmployee()`
   - Calls `/admin/create-user-for-employee` endpoint

---

## Workflow After Fix

### Step 1: HR Creates Employee
```
HR Dashboard → Employee Records → Add New Employee
↓
Employee created WITHOUT user account
```

### Step 2: Admin Sees Pending Employee
```
Admin Dashboard → User Management
↓
"Pending Employee Accounts" section shows:
- Employee ID: 29
- Name: John Doe
- Email: john@company.com
- Position: Developer
- [Create User Account] button
```

### Step 3: Admin Creates User Account
```
Admin clicks "Create User Account"
↓
Dialog opens:
- Employee: John Doe (Developer)
- User Email: [john@company.com] (editable)
- Initial Password: [enter password]
↓
User account created and linked to employee
↓
Employee disappears from "Pending" table
User appears in "User Account Management" table
```

---

## API Flow

### Create Employee (HR)
```http
POST /api/employees
{
  "name": "John Doe",
  "email": "john@company.com",
  "jobTitle": "Developer",
  "contact": "555-0123"
}
```
**Result**: Employee #29 created (no user)

### Get Pending Employees (Admin)
```http
GET /admin/pending-employees
```
**Response**:
```json
[
  {
    "employeeId": 29,
    "email": "john@company.com",
    "name": "John Doe",
    "jobTitle": "Developer",
    "contact": "555-0123"
  }
]
```

### Create User for Employee (Admin)
```http
POST /admin/create-user-for-employee
{
  "employeeId": 29,
  "email": "john@company.com",
  "password": "SecurePass123",
  "role": "EMPLOYEE"
}
```
**Result**: 
- User account created
- Linked to employee #29
- Role "EMPLOYEE" assigned
- `adminPasswordAssigned` = true

---

## Testing Steps

1. ✅ **HR Creates Employee**
   - Login as HR
   - Go to Employee Records
   - Add new employee
   - Verify NO user is created

2. ✅ **Admin Sees Pending**
   - Login as Admin
   - Go to User Management
   - Check "Pending Employee Accounts" section
   - Verify new employee appears

3. ✅ **Admin Creates User**
   - Click "Create User Account" button
   - Enter email (can modify if needed)
   - Enter password
   - Click "Create User"

4. ✅ **Verify Link**
   - Check employee disappears from pending
   - Check user appears in "User Account Management"
   - Verify user has "Employee Row" = Yes

5. ✅ **Test Login**
   - Logout
   - Login with new user credentials
   - Verify access to employee dashboard

---

## Files Modified

### Backend (3 files + 1 new)
1. `EmployeeRepository.java` - Added findEmployeesWithoutUsers query
2. `AdminUserController.java` - Added 2 new endpoints + 1 DTO
3. `PendingEmployeeDto.java` - NEW file

### Frontend (1 file)
1. `UserManagement.js` - Complete refactor of pending section

---

## Database Impact

**No migration needed!** The database schema is already correct from previous changes:
- `employee` table has auto-increment `employee_id`
- `user_auth` table has `employee_id` FK
- Unidirectional relationship: User → Employee

---

## Benefits

✅ **Clear Separation**: HR manages employees, Admin manages access  
✅ **Flexible**: Employee email ≠ User email (if needed)  
✅ **Secure**: Admin controls who gets system access  
✅ **Auditable**: Clear distinction between employee creation and user creation  
✅ **No Auto-Creation**: Employees exist without forced user accounts  

---

## Next Steps (Optional Enhancements)

1. **Bulk User Creation**: Select multiple pending employees and create users at once
2. **Email Notification**: Send email to new users with temporary password
3. **Role Selection**: Allow admin to choose role during user creation
4. **Search/Filter**: Add search in pending employees table
5. **Employee Details**: Show more employee info in the dialog

---

**Date**: November 2, 2025  
**Status**: ✅ Completed and Tested
