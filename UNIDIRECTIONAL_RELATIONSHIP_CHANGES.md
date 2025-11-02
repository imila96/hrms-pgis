# Unidirectional Relationship: User → Employee

## Overview
Changed from **bidirectional** to **unidirectional** relationship between User and Employee entities.

### Previous (Bidirectional with @MapsId)
```
User ←→ Employee
- Employee had @MapsId, sharing PK with User
- Employee.user field
- User.employee field (mappedBy)
- employee_id = user_id (same value)
```

### Current (Unidirectional)
```
User → Employee
- User has FK to Employee (employee_id)
- Employee has NO reference to User
- User and Employee have independent IDs
- Multiple users COULD link to same employee (if needed)
```

---

## Database Changes

### Employee Table
- **Before**: `employee_id` was NOT auto-increment (copied from User via @MapsId)
- **After**: `employee_id` is auto-increment (IDENTITY/SERIAL)

### User_Auth Table
- **Added**: `employee_id` column (nullable, FK to employee.employee_id)
- **Relationship**: User owns the relationship via FK

### Migration Script
Location: `backend/scripts/update_employee_user_relationship.sql`

**Run this script to migrate existing data!**

---

## Business Logic Changes

### 1. HR Creates Employee (NEW BEHAVIOR)
**Before**: Creating employee automatically created a User account
**After**: HR creates employee WITHOUT creating a user account

```java
// EmployeeServiceImpl.createEmployee()
// Now just creates Employee entity
// No User creation happens
```

**Impact**:
- HR can add employees to the system
- Employees exist in the database without login credentials
- Admin must separately create user accounts

### 2. Admin Creates User & Links to Employee
**Location**: `AdminUserController.setRoles()`

**Workflow**:
1. Admin creates User (email, password)
2. Admin assigns roles to User
3. Admin links User to existing Employee via `employeeId`

```json
PUT /admin/users/{userId}/roles
{
  "roles": ["EMPLOYEE"],
  "employeeId": 123  // Link to existing employee
}
```

**Fallback**: If no employeeId provided and roles require it, a basic Employee record is auto-created.

### 3. Profile Service Adjustments
**Location**: `ProfileService`

**Changes**:
- Navigation is User → Employee (not bidirectional)
- `user.getEmployee()` still works (unidirectional)
- Finding User from Employee requires query or stream

```java
// Finding user linked to an employee (now requires explicit search)
var user = userRepo.findAll().stream()
    .filter(u -> u.getEmployee() != null && 
                 u.getEmployee().getEmployeeId().equals(empId))
    .findFirst()
    .orElse(null);
```

---

## Entity Changes

### Employee Entity
```java
@Entity
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // NOW auto-increment
    private Integer employeeId;
    
    // ... other fields
    // REMOVED: User user field
}
```

### User Entity
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "employeeId")
    private Employee employee;  // User owns the relationship
    
    // ... other fields
}
```

---

## API Impact

### Employee Creation (HR)
```http
POST /api/employees
{
  "name": "John Doe",
  "email": "john@example.com",
  "jobTitle": "Developer",
  "contact": "123-456-7890",
  "hireDate": "2025-01-01"
}
```
**Result**: Employee created, NO user account created

### User Creation & Linking (Admin)
```http
# Step 1: Create user
POST /admin/users
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

# Step 2: Assign roles and link to employee
PUT /admin/users/{userId}/roles
{
  "roles": ["EMPLOYEE"],
  "employeeId": 123  // Links to existing employee
}
```

---

## Benefits of Unidirectional Relationship

### ✅ Advantages
1. **Independent Lifecycles**: Employee records can exist without user accounts
2. **Clearer Ownership**: User owns the relationship (cleaner semantics)
3. **Flexible HR Workflow**: HR manages employee data, Admin manages access
4. **No Mandatory Coupling**: Not all employees need system access immediately
5. **Simpler Employee Entity**: Employee is a pure data entity

### ⚠️ Considerations
1. **Reverse Lookup**: Finding User from Employee requires explicit query
2. **Query Performance**: May need index on `user_auth.employee_id` (included in migration)
3. **Null Safety**: Must handle cases where Employee has no linked User

---

## Testing Checklist

- [ ] Run migration script on database
- [ ] HR can create employee without user being created
- [ ] Admin can create user separately
- [ ] Admin can link user to existing employee via employeeId
- [ ] Profile endpoints work correctly (user → employee navigation)
- [ ] Employee update doesn't fail when no user linked
- [ ] User deletion doesn't delete employee record
- [ ] Existing employees with users still work after migration

---

## Rollback Plan (If Needed)

If you need to revert to bidirectional relationship:
1. Keep the migration script backup
2. Revert entity changes (restore @MapsId)
3. Restore old service logic
4. Run reverse migration (drop FK, restore @MapsId constraint)

**Note**: Data loss may occur if employees exist without users!

---

## Questions & Answers

**Q: Can one employee have multiple user accounts?**
A: Technically yes (FK allows it), but business logic should prevent this.

**Q: What happens if employee is deleted?**
A: User.employee FK is set to NULL (ON DELETE SET NULL in migration)

**Q: Can a user exist without an employee?**
A: Yes! System users (like pure ADMIN) may not need employee records.

**Q: Is bidirectional mapping mandatory?**
A: No! Unidirectional is cleaner when you don't need reverse navigation often.

---

## Summary of Code Changes

### Modified Files:
1. `Employee.java` - Removed User field, added @GeneratedValue
2. `User.java` - Changed from mappedBy to @JoinColumn
3. `EmployeeRepository.java` - Changed `findByUserEmail` to `findByEmail`
4. `EmployeeServiceImpl.java` - Removed auto user creation logic
5. `AdminUserController.java` - Added employeeId parameter, updated linking logic
6. `ProfileService.java` - Updated to handle unidirectional navigation

### New Files:
1. `backend/scripts/update_employee_user_relationship.sql` - Migration script
2. `UNIDIRECTIONAL_RELATIONSHIP_CHANGES.md` - This documentation

---

**Date**: November 2, 2025  
**Version**: 2.0 - Unidirectional Relationship Implementation
