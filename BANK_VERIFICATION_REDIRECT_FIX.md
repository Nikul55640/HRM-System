# Bank Verification Redirect Issue - Diagnosis & Fix

## Issue Description

When trying to verify bank details in the admin panel, users are being redirected to an unauthorized page instead of staying on the bank verification page to see the actual error.

## Root Cause Analysis

### 1. API Interceptor Auto-Redirect ✅ IDENTIFIED

**Problem**: The API service has an interceptor that automatically redirects to `/unauthorized` on 403 errors:

```javascript
// Handle 403 Forbidden
if (error.response.status === 403) {
  const errorMsg = error.response?.data?.message || 'Access denied';
  toast.error(errorMsg);
  if (!errorMsg.includes('Employee profile') && window.location.pathname !== "/unauthorized") {
    window.location.href = "/unauthorized"; // ← THIS CAUSES THE REDIRECT
  }
}
```

**Location**: `frontend/src/services/api.js`

### 2. Permission Requirements ✅ IDENTIFIED

**Required Permissions**:
- `GET /pending-verifications`: Requires `MODULES.EMPLOYEE.VIEW_ALL`
- `PUT /verify/:employeeId`: Requires `MODULES.EMPLOYEE.EDIT_ANY`

**Roles with Access**:
- `SuperAdmin`: Has all permissions
- `HR`: Should have these permissions
- `HR_ADMIN`: Should have these permissions

### 3. Potential Permission Issues ⚠️ SUSPECTED

**Possible Causes**:
1. User role in database doesn't match expected format
2. Role normalization not working correctly
3. Permission mapping missing for user's role
4. User doesn't have required permissions

## Fixes Applied

### 1. Modified API Interceptor ✅ FIXED

**Change**: Prevent auto-redirect for admin pages and bank verification:

```javascript
// Handle 403 Forbidden
if (error.response.status === 403) {
  const errorMsg = error.response?.data?.message || 'Access denied';
  toast.error(errorMsg);
  
  // Don't redirect for certain pages/endpoints to allow proper error handling
  const currentPath = window.location.pathname;
  const isSpecialPage = currentPath.includes('/bank-verification') || 
                       currentPath.includes('/admin/') ||
                       errorMsg.includes('Employee profile');
  
  // Only redirect if it's a general forbidden error and not on special admin pages
  if (!isSpecialPage && currentPath !== "/unauthorized") {
    console.log('🔄 Redirecting to unauthorized page due to 403 error');
    window.location.href = "/unauthorized";
  } else {
    console.log('🚫 403 error on special page, not redirecting:', currentPath);
  }
}
```

**Result**: Users will now see the actual error message instead of being redirected.

### 2. Enhanced Error Handling ✅ ADDED

**Frontend Changes**:
- Added detailed error logging with user role information
- Added specific error messages for permission issues
- Added development debug panel showing user info and required permissions

**Backend Changes**:
- Added comprehensive logging in verification process
- Added user role information in error responses

### 3. Debug Tools Created ✅ ADDED

**Scripts**:
- `debug-bank-verification-permissions.js`: Comprehensive permission debugging
- Enhanced logging in bank verification page
- Development debug panel showing user info

## Testing & Debugging

### 1. Check User Permissions

Run the permission debug script:
```bash
cd HRM-System/backend
node debug-bank-verification-permissions.js
```

This will show:
- Current user roles in database
- Role normalization results
- Permission mappings
- Which users have required permissions

### 2. Frontend Debugging

1. Open browser dev tools
2. Navigate to `/admin/bank-verification`
3. Check console for debug information:
   - User role and info
   - API request/response details
   - Permission error details

### 3. Development Debug Panel

In development mode, the page shows:
- Current user ID, email, role, name
- Required permissions for the feature
- Real-time debugging information

## Expected Behavior After Fix

### ✅ With Proper Permissions:
- Page loads normally
- Account numbers visible to admin
- Verification buttons work
- No redirects

### ✅ Without Proper Permissions:
- Page shows error message instead of redirecting
- User sees specific permission error
- Debug info shows user role and required permissions
- User stays on the page to understand the issue

## Troubleshooting Guide

### If Still Getting Redirected:
1. Clear browser cache and reload
2. Check if API interceptor changes were applied
3. Verify current path detection is working

### If Getting Permission Errors:
1. Run `debug-bank-verification-permissions.js`
2. Check user's role in database
3. Verify role has required permissions
4. Check role normalization is working

### If Account Numbers Not Showing:
1. Check browser console for API response data
2. Verify backend returns full account numbers
3. Run `test-bank-verification-api.js`

## Permission Fix (If Needed)

If the debug script shows permission issues, you may need to:

### 1. Update User Role
```sql
-- If user has wrong role format
UPDATE users SET role = 'SuperAdmin' WHERE email = 'admin@example.com';
-- or
UPDATE users SET role = 'HR' WHERE email = 'hr@example.com';
```

### 2. Check Role Permissions Mapping
Ensure the role permissions include required permissions in `backend/src/config/rolePermissions.js`.

### 3. Verify Role Normalization
Check that `normalizeRole()` function correctly maps database roles to permission system roles.

## Testing Checklist

### ✅ Permission Testing:
- [ ] SuperAdmin user can access bank verification
- [ ] HR user can access bank verification  
- [ ] Employee user gets proper error (no redirect)
- [ ] Debug script shows correct permissions

### ✅ Functionality Testing:
- [ ] Account numbers visible to authorized users
- [ ] Approve/reject buttons work
- [ ] Error messages are clear and helpful
- [ ] No unwanted redirects occur

### ✅ Error Handling Testing:
- [ ] 403 errors show message instead of redirecting
- [ ] Debug info helps identify permission issues
- [ ] Console logs provide troubleshooting info

## Rollback Plan

If issues arise, revert these files:
1. `frontend/src/services/api.js` - Remove special page detection
2. `frontend/src/modules/admin/pages/BankVerification/BankVerificationPage.jsx` - Remove debug enhancements

The core functionality will remain intact, but auto-redirect behavior will return.

## Future Improvements

1. **Role Management UI**: Add interface for managing user roles and permissions
2. **Permission Testing Tool**: Create admin tool to test user permissions
3. **Better Error Messages**: More specific error messages for different permission issues
4. **Permission Documentation**: Document which roles can access which features