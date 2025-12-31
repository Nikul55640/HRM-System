# Attendance Corrections 403 Error - Debug Guide

## Current Status: 403 Access Denied

The user is getting a 403 error when trying to access `/admin/attendance/corrections`. This indicates the user is authenticated but doesn't have the required permissions.

## Debug Steps

### 1. Check User Role and Permissions
Navigate to `/debug-auth` to see:
- Current user's role (exact string)
- Permission checks
- Role matching results
- API test results

### 2. Expected vs Actual Roles

**Expected Roles for Admin Routes:**
- `"SuperAdmin"`
- `"HR Administrator"`
- `"HR Manager"`

**Check if user's role matches exactly** (case-sensitive, no extra spaces)

### 3. Common Issues and Fixes

#### Issue 1: Role Mismatch
**Problem**: User role doesn't match expected roles exactly
**Solution**: Check database for actual role values

```sql
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
```

#### Issue 2: Permission System Not Working
**Problem**: Permission checks failing
**Solution**: Check if role is mapped in `ROLE_PERMISSIONS`

#### Issue 3: Token Issues
**Problem**: Invalid or expired token
**Solution**: Re-login to get fresh token

#### Issue 4: Backend Route Authorization
**Problem**: Backend still rejecting requests
**Solution**: Verify backend routes use correct role names

## Fixes Applied So Far

### ✅ Backend Route Authorization
```javascript
// Fixed in: backend/src/routes/admin/attendanceCorrection.routes.js
router.use(authorize(['SuperAdmin', 'HR Administrator', 'HR Manager']));
```

### ✅ Frontend Role Permissions
```javascript
// Fixed in: frontend/src/core/utils/rolePermissions.js
export const ROLE_PERMISSIONS = {
  [ROLES.EMPLOYEE]: EMPLOYEE_PERMISSIONS,
  [ROLES.HR_ADMIN]: HR_PERMISSIONS,
  [ROLES.HR_MANAGER]: HR_PERMISSIONS,
  [ROLES.SUPER_ADMIN]: SUPER_ADMIN_PERMISSIONS,
};
```

### ✅ usePermissions Hook
```javascript
// Fixed in: frontend/src/core/hooks/usePermissions.js
// Updated role checks to use correct role names
```

## Debugging Commands

### Check Database Roles
```sql
-- Check all user roles
SELECT DISTINCT role FROM users;

-- Check specific user
SELECT id, email, role, isActive FROM users WHERE email = 'your-email';
```

### Check API Response
```javascript
// In browser console
fetch('/api/admin/attendance-corrections/pending', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth-storage')}`
  }
}).then(r => r.json()).then(console.log);
```

## Next Steps

1. **Visit `/debug-auth`** to see current user info
2. **Check exact role string** - must match exactly
3. **Verify permissions** are being calculated correctly
4. **Test API call** from debug page
5. **Check browser console** for any errors

## Potential Solutions

### If Role Doesn't Match:
```sql
-- Update user role in database
UPDATE users SET role = 'HR Administrator' WHERE email = 'your-email@example.com';
```

### If Permissions Not Working:
- Clear browser storage and re-login
- Check if role is in ROLE_PERMISSIONS mapping
- Verify permission constants are correct

### If API Still Failing:
- Check backend server logs
- Verify JWT token is valid
- Check if backend routes are using updated authorization

## Test Cases

After fixes, these should work:
1. ✅ Login as HR Administrator → Can access `/admin/attendance/corrections`
2. ✅ Login as HR Manager → Can access `/admin/attendance/corrections`  
3. ✅ Login as SuperAdmin → Can access `/admin/attendance/corrections`
4. ❌ Login as Employee → Should get 403 (expected behavior)

## Contact Points

If still having issues, check:
1. Browser console for JavaScript errors
2. Network tab for API response details
3. Backend server logs for authorization errors
4. Database for actual user role values