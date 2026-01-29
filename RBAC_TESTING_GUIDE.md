# RBAC Sidebar Navigation - Testing Guide

## Quick Test Instructions

### Prerequisites
- Backend running: `npm run dev` in `HRM-System/backend`
- Frontend running: `npm run dev` in `HRM-System/frontend`
- Database seeded with test data

---

## Test Credentials

### Employee Role
- **Email**: john@hrm.com
- **Password**: john123
- **Expected Sidebar**: My Workspace + Settings visible

### HR_Manager Role
- **Email**: hr_manager@hrm.com
- **Password**: password123
- **Expected Sidebar**: Admin sections visible, NO My Workspace/Settings

### HR_Admin Role
- **Email**: hr_admin@hrm.com
- **Password**: password123
- **Expected Sidebar**: All admin sections including System

### SuperAdmin Role
- **Email**: admin@hrm.com
- **Password**: admin123
- **Expected Sidebar**: All sections including System

---

## Test Procedure

### Step 1: Test Employee Role
1. Open browser and go to `http://localhost:5173`
2. Login with: `john@hrm.com` / `john123`
3. Check sidebar for these sections:
   - ✅ Overview (Dashboard, Notifications)
   - ✅ My Workspace (Profile, Bank Details, Attendance, Leave, Leads, Shifts, Calendar)
   - ✅ Settings (Profile, Security, Emergency Contacts)
4. Verify NO admin sections appear:
   - ❌ Requests & Approvals
   - ❌ Attendance & Time
   - ❌ Leave & Holidays
   - ❌ People
   - ❌ Organization
   - ❌ System

**Expected Result**: ✅ PASS - Only personal sections visible

---

### Step 2: Test HR_Manager Role
1. Logout from Employee account
2. Login with: `hr_manager@hrm.com` / `password123`
3. Check sidebar for these sections:
   - ✅ Overview (Dashboard, Notifications)
   - ✅ Requests & Approvals (Attendance Corrections, Leave Requests)
   - ✅ Attendance & Time (Attendance Overview, Live Attendance, Shift Management)
   - ✅ Leave & Holidays (Leave Balances, Holiday Management, Smart Calendar, Holiday Sync)
   - ✅ People (Employees, Departments, Designations, Bank Verification, Lead Management)
   - ✅ Organization (Policies, Documents, Announcements)
4. Verify personal sections do NOT appear:
   - ❌ My Workspace
   - ❌ Settings
5. Verify System section does NOT appear:
   - ❌ System

**Expected Result**: ✅ PASS - Admin sections visible, personal sections hidden

---

### Step 3: Test HR_Admin Role
1. Logout from HR_Manager account
2. Login with: `hr_admin@hrm.com` / `password123`
3. Check sidebar for these sections:
   - ✅ Overview (Dashboard, Notifications)
   - ✅ Requests & Approvals (Attendance Corrections, Leave Requests)
   - ✅ Attendance & Time (Attendance Overview, Live Attendance, Shift Management)
   - ✅ Leave & Holidays (Leave Balances, Rollover, Holiday Management, Smart Calendar, Holiday Sync)
   - ✅ People (Employees, Departments, Designations, Bank Verification, Lead Management)
   - ✅ Organization (Policies, Documents, Announcements)
   - ✅ System (Users & Roles, Admin Settings, System Policies, Audit Logs)
4. Verify personal sections do NOT appear:
   - ❌ My Workspace
   - ❌ Settings

**Expected Result**: ✅ PASS - All admin sections visible including System

---

### Step 4: Test SuperAdmin Role
1. Logout from HR_Admin account
2. Login with: `admin@hrm.com` / `admin123`
3. Check sidebar for these sections:
   - ✅ Overview (Dashboard, Notifications)
   - ✅ Requests & Approvals (Attendance Corrections, Leave Requests)
   - ✅ Attendance & Time (Attendance Overview, Live Attendance, Shift Management)
   - ✅ Leave & Holidays (Leave Balances, Rollover, Holiday Management, Smart Calendar, Holiday Sync)
   - ✅ People (Employees, Departments, Designations, Bank Verification, Lead Management)
   - ✅ Organization (Policies, Documents, Announcements)
   - ✅ System (Users & Roles, Admin Settings, System Policies, Audit Logs)
4. Verify personal sections do NOT appear:
   - ❌ My Workspace
   - ❌ Settings

**Expected Result**: ✅ PASS - All admin sections visible including System

---

## Troubleshooting

### Issue: "My Workspace" still appears for HR roles
**Solution**: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check that Sidebar.jsx has the role check: `user?.role === "Employee"`

### Issue: "Settings" still appears for HR roles
**Solution**: 
1. Clear browser cache
2. Hard refresh
3. Check that Sidebar.jsx has the role check: `user?.role === "Employee"`

### Issue: Admin sections don't appear for HR roles
**Solution**:
1. Check that user has correct role in database
2. Verify backend permissions are correct in `rolePermissions.js`
3. Check browser console for permission errors

### Issue: Employee can't see "My Workspace"
**Solution**:
1. Verify user role is exactly "Employee" (case-sensitive)
2. Check that user has `MODULES.EMPLOYEE.VIEW_OWN` permission
3. Check browser console for errors

---

## Browser Console Debugging

Open browser DevTools (F12) and check console for:

```javascript
// Check current user
console.log('User:', user);

// Check permissions
console.log('Can view own:', can.do(MODULES.EMPLOYEE.VIEW_OWN));

// Check role
console.log('User role:', user?.role);

// Check if Employee
console.log('Is Employee:', user?.role === "Employee");
```

---

## Expected Behavior Summary

| Section | Employee | HR_Manager | HR_Admin | SuperAdmin |
|---------|----------|-----------|----------|-----------|
| Overview | ✅ | ✅ | ✅ | ✅ |
| My Workspace | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |
| Requests & Approvals | ❌ | ✅ | ✅ | ✅ |
| Attendance & Time | ❌ | ✅ | ✅ | ✅ |
| Leave & Holidays | ❌ | ✅ | ✅ | ✅ |
| People | ❌ | ✅ | ✅ | ✅ |
| Organization | ❌ | ✅ | ✅ | ✅ |
| System | ❌ | ❌ | ✅ | ✅ |

---

## Test Results Template

```
Test Date: _______________
Tester: ___________________

Employee Role Test: [ ] PASS [ ] FAIL
HR_Manager Role Test: [ ] PASS [ ] FAIL
HR_Admin Role Test: [ ] PASS [ ] FAIL
SuperAdmin Role Test: [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## Next Steps After Testing

1. ✅ Verify all roles show correct sidebar sections
2. ✅ Verify personal sections only appear for Employee
3. ✅ Verify admin sections appear for HR roles
4. ✅ Verify System section only appears for HR_Admin and SuperAdmin
5. ✅ Test navigation to each section works correctly
6. ✅ Test permission checks work on actual pages

---

## Related Files

- Sidebar Component: `HRM-System/frontend/src/core/layout/Sidebar.jsx`
- Backend Permissions: `HRM-System/backend/src/config/rolePermissions.js`
- Frontend Permissions: `HRM-System/frontend/src/core/utils/rolePermissions.js`
- RBAC Summary: `HRM-System/RBAC_SIDEBAR_FIX_SUMMARY.md`
