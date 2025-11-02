# Quick Reference: New Employee & User Workflow

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: HR Creates Employee (No User Account)            │
│  ───────────────────────────────────────────────────────   │
│  POST /api/employees                                        │
│  - Employee record created in database                      │
│  - No login credentials created                            │
│  - Employee gets auto-incremented ID                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Admin Creates User Account (Separately)          │
│  ───────────────────────────────────────────────────────   │
│  POST /admin/users                                         │
│  - User account created with email & password              │
│  - No roles assigned yet                                   │
│  - No employee link yet                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Admin Assigns Roles & Links to Employee          │
│  ───────────────────────────────────────────────────────   │
│  PUT /admin/users/{userId}/roles                           │
│  - Roles assigned to user                                  │
│  - User linked to existing employee via employeeId         │
│  - Employee can now login                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## API Examples

### 1️⃣ HR Creates Employee
```bash
POST http://localhost:8080/api/employees
Content-Type: application/json
Authorization: Bearer {hr-token}

{
  "name": "Alice Johnson",
  "email": "alice.johnson@company.com",
  "contact": "555-0123",
  "address": "123 Main St",
  "jobTitle": "Senior Developer",
  "hireDate": "2025-11-15",
  "department": "Engineering"
}
```

**Response**:
```json
{
  "employeeId": 45,
  "name": "Alice Johnson",
  "email": "alice.johnson@company.com",
  "jobTitle": "Senior Developer",
  ...
}
```

**Important**: Note the `employeeId` (45 in this example) - you'll need this later!

---

### 2️⃣ Admin Creates User Account
```bash
POST http://localhost:8080/admin/users
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "email": "alice.johnson@company.com",
  "password": "TempPassword123!"
}
```

**Response**:
```json
{
  "id": 78,
  "email": "alice.johnson@company.com",
  "roles": [],
  "hasEmployee": false,
  "adminPasswordAssigned": true
}
```

**Important**: Note the user `id` (78 in this example)

---

### 3️⃣ Admin Links User to Employee & Assigns Roles
```bash
PUT http://localhost:8080/admin/users/78/roles
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "roles": ["EMPLOYEE"],
  "employeeId": 45
}
```

**Response**: 204 No Content (Success!)

---

## Alternative: Create Employee During Role Assignment

If you want to create a user and employee together (legacy behavior):

```bash
PUT http://localhost:8080/admin/users/78/roles
Content-Type: application/json
Authorization: Bearer {admin-token}

{
  "roles": ["EMPLOYEE"],
  "name": "Bob Smith",
  "contact": "555-0199",
  "jobTitle": "Junior Developer",
  "hireDate": "2025-11-20",
  "address": "456 Oak Ave",
  "empEmail": "bob.smith@company.com"
}
```

This creates an employee record if:
- No `employeeId` is provided
- User doesn't already have an employee linked
- Roles include ADMIN, HR, or EMPLOYEE

---

## Entity Relationship

```
┌──────────────┐           ┌──────────────┐
│     USER     │──────────▶│   EMPLOYEE   │
│              │           │              │
│ userId (PK)  │           │ employeeId   │
│ email        │           │ name         │
│ password     │           │ email        │
│ employee_id  │ (FK)      │ jobTitle     │
└──────────────┘           └──────────────┘
     Owns                     Independent
  Relationship               Can exist alone
```

**Key Points**:
- User has FK to Employee (unidirectional)
- Employee does NOT know about User
- Employee can exist WITHOUT a User
- User.employee can be NULL

---

## Database Migration

**IMPORTANT**: Before running the application, execute the migration script!

```bash
# Connect to your PostgreSQL database
psql -U postgres -d hrms_db

# Run the migration script
\i backend/scripts/update_employee_user_relationship.sql
```

Or using pgAdmin / DBeaver:
1. Open the file: `backend/scripts/update_employee_user_relationship.sql`
2. Execute the script

**What it does**:
- Adds `employee_id` column to `user_auth`
- Migrates existing data
- Makes `employee_id` auto-increment in `employee` table
- Adds foreign key constraint
- Creates indexes for performance

---

## Common Scenarios

### Scenario A: New Hire
1. HR creates employee record ✅
2. Employee works without system access initially
3. When ready for system access, Admin creates user & links

### Scenario B: Contractor
1. HR creates employee record ✅
2. Contractor works without system access (no user needed)
3. If permanent hire, Admin creates user later

### Scenario C: System Admin
1. Admin creates user (no employee needed) ✅
2. User has ADMIN role only
3. No employee record required

### Scenario D: Emergency Access
1. Admin creates user immediately ✅
2. Admin assigns roles with auto-employee creation (fallback)
3. HR updates employee details later

---

## Query Examples

### Find all employees without user accounts
```sql
SELECT e.* 
FROM employee e
LEFT JOIN user_auth u ON u.employee_id = e.employee_id
WHERE u.user_id IS NULL;
```

### Find all users without employee records
```sql
SELECT u.* 
FROM user_auth u
WHERE u.employee_id IS NULL;
```

### Find user for a specific employee
```sql
SELECT u.* 
FROM user_auth u
WHERE u.employee_id = 45;
```

---

## Troubleshooting

### Issue: Employee can't login
**Check**:
1. Does employee have a linked user account?
   ```sql
   SELECT u.* FROM user_auth u WHERE u.employee_id = ?
   ```
2. Does user have roles assigned?
3. Is user account active?

### Issue: Profile not loading
**Check**:
1. User must have employee linked: `user.employee != null`
2. Employee email should match user email (best practice)

### Issue: Duplicate employees
**Prevent**:
- Add unique constraint on employee.email if needed
- Check before creating user if employee exists

---

## Development Tips

### Testing the Flow
```javascript
// 1. Create employee (as HR)
const empResp = await axios.post('/api/employees', employeeData);
const employeeId = empResp.data.employeeId;

// 2. Create user (as Admin)
const userResp = await axios.post('/admin/users', { email, password });
const userId = userResp.data.id;

// 3. Link user to employee (as Admin)
await axios.put(`/admin/users/${userId}/roles`, {
  roles: ['EMPLOYEE'],
  employeeId: employeeId
});
```

### Frontend Considerations
- HR screens: Only deal with Employee entity
- Admin screens: Manage both User and Employee, show linking UI
- Profile screens: Navigate User → Employee (always from user perspective)

---

## Summary

**Before**:
- Creating employee = auto user creation ❌
- Bidirectional coupling ❌
- @MapsId complexity ❌

**After**:
- Creating employee = just employee ✅
- User links to employee (unidirectional) ✅
- Independent lifecycles ✅
- Flexible workflow ✅

---

**Last Updated**: November 2, 2025
**Related Files**:
- `UNIDIRECTIONAL_RELATIONSHIP_CHANGES.md` - Detailed technical changes
- `backend/scripts/update_employee_user_relationship.sql` - Database migration
