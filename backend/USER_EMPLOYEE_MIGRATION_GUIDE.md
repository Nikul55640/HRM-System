# User-Employee Relationship Migration Guide

## 🎯 What This Fixes

**Before (Problematic):**
- User has `name` + `employeeId` → Employee
- Employee has `email` (duplicated)
- Confusing relationship direction
- Data sync issues

**After (Clean):**
- User has `email` + `role` (authentication only)
- Employee has `userId` → User (HR data only)
- Clear separation of concerns
- No data duplication

## 🚀 Migration Steps

### Step 1: Backup Your Database
```bash
# Create backup before migration
mysqldump -u your_username -p your_database > backup_before_migration.sql
```

### Step 2: Run Data Migration (Links existing records)
```bash
cd HRM-System/backend
node migrate-user-employee-data.js
```

This will:
- Match existing Users and Employees by email
- Set `userId` in Employee records
- Show you unmatched records that need manual handling

### Step 3: Run Schema Migration
```bash
# Run the database schema changes
node run-migration.js fix-user-employee-relationship
```

This will:
- Add `userId` column to employees
- Remove `email` from employees
- Remove `employeeId` and `name` from users
- Update indexes

### Step 4: Update Your Code

**Controllers that need updating:**
- Employee creation/update controllers
- Authentication controllers
- Any code that accesses `user.name` or `employee.email`

**Common Query Changes:**

```javascript
// OLD WAY (don't do this anymore)
const user = await User.findOne({
  where: { id: userId },
  include: [{ model: Employee, as: 'employee' }]
});

// NEW WAY (correct)
const employee = await Employee.findOne({
  where: { userId: userId },
  include: [{ model: User, as: 'user' }]
});

// Or get user with employee
const user = await User.findOne({
  where: { id: userId },
  include: [{ model: Employee, as: 'employee' }]
});
```

## 🔍 Verification

After migration, verify:

1. **Check relationships:**
```sql
SELECT u.email, u.role, e.employeeId, e.firstName, e.lastName 
FROM users u 
LEFT JOIN employees e ON u.id = e.userId;
```

2. **Check for orphaned records:**
```sql
-- Users without employees
SELECT * FROM users u WHERE NOT EXISTS (
  SELECT 1 FROM employees e WHERE e.userId = u.id
);

-- Employees without users
SELECT * FROM employees e WHERE userId IS NULL;
```

## 🚨 Troubleshooting

### Issue: Unmatched Users/Employees

**Unmatched Users (have login, no HR profile):**
- System accounts (SuperAdmin, etc.) - This is normal
- New users who haven't completed onboarding

**Unmatched Employees (have HR profile, no login):**
- Terminated employees - Check their status
- Employees who haven't been given system access yet

### Issue: Migration Fails

1. Check database constraints
2. Ensure no duplicate emails
3. Verify foreign key relationships
4. Check the migration logs for specific errors

## 📋 Post-Migration Checklist

- [ ] All existing users can still log in
- [ ] Employee profiles display correctly
- [ ] No broken API endpoints
- [ ] Frontend forms work with new structure
- [ ] Reports and exports function properly
- [ ] Audit logs are working

## 🔄 Rollback (If Needed)

If something goes wrong:

```bash
# Restore from backup
mysql -u your_username -p your_database < backup_before_migration.sql

# Or run migration rollback
node run-migration.js fix-user-employee-relationship --down
```

## 💡 Benefits After Migration

1. **Clear separation**: Authentication vs HR data
2. **No duplication**: Single source of truth for each data type
3. **Better performance**: Fewer joins needed
4. **Easier maintenance**: Clear ownership of data
5. **Industry standard**: How enterprise HRM systems work

## 🎉 You're Done!

Your HRM system now follows the industry-standard pattern:
- **User** = Login + Role + Security
- **Employee** = Personal + Job + HR Data
- **Clean relationship** = Employee.userId → User.id