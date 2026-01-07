# Notification Controllers Audit

## Overview
This document provides a comprehensive audit of all controllers in the HRM system that send notifications to users. Each controller is analyzed for notification types, role targeting, and potential issues.

## Controllers Sending Notifications

### 1. Employee Leave Request Controller
**File**: `backend/src/controllers/employee/leaveRequest.controller.js`

**Notifications Sent**:
- ✅ **Leave Request Submitted** (to employee)
  - Trigger: When employee submits leave request
  - Type: `info`, Category: `leave`
  - Message: Confirmation of submission with details

- ✅ **New Leave Request** (to admins)
  - Trigger: When employee submits leave request
  - Type: `info`, Category: `leave`
  - Roles: `['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER']`
  - Message: Notification to admins about new request

- ✅ **Leave Request Cancelled** (to employee)
  - Trigger: When employee cancels leave request
  - Type: `warning`, Category: `leave`
  - Message: Confirmation of cancellation

- ✅ **Leave Request Cancelled** (to admins)
  - Trigger: When employee cancels leave request
  - Type: `info`, Category: `leave`
  - Roles: `['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER']`
  - Message: Notification to admins about cancellation

**Status**: ✅ **FIXED** - Recently updated with proper notifications

---

### 2. Admin Leave Request Controller
**File**: `backend/src/controllers/admin/leaveRequest.controller.js`

**Notifications Sent**:
- ✅ **Leave Request Approved** (to employee)
  - Trigger: When admin approves leave request
  - Type: `success`, Category: `leave`
  - Message: Approval confirmation with dates

- ✅ **Leave Request Rejected** (to employee)
  - Trigger: When admin rejects leave request
  - Type: `error`, Category: `leave`
  - Message: Rejection notification with reason

**Status**: ✅ **WORKING** - Properly implemented

---

### 3. Employee Attendance Correction Requests Controller
**File**: `backend/src/controllers/employee/attendanceCorrectionRequests.controller.js`

**Notifications Sent**:
- ✅ **New Attendance Correction Request** (to admins)
  - Trigger: When employee submits correction request
  - Type: `info`, Category: `attendance`
  - Roles: `['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER']`
  - Message: Notification about new correction request

**Status**: ✅ **FIXED** - Recently updated with proper role targeting

---

### 4. Admin Attendance Correction Controller
**File**: `backend/src/controllers/admin/attendanceCorrection.controller.js`

**Notifications Sent**:
- ✅ **Attendance Correction Approved** (to employee)
  - Trigger: When admin approves correction request
  - Type: `success`, Category: `attendance`
  - Message: Approval confirmation

- ✅ **Attendance Correction Rejected** (to employee)
  - Trigger: When admin rejects correction request
  - Type: `error`, Category: `attendance`
  - Message: Rejection notification with reason

**Status**: ✅ **WORKING** - Properly implemented

---

### 5. Employee Bank Details Controller
**File**: `backend/src/controllers/employee/bankDetails.controller.js`

**Notifications Sent**:
- ✅ **Bank Details Submitted** (to employee)
  - Trigger: When employee submits bank details
  - Type: `info`, Category: `bank`
  - Message: Submission confirmation

- ⚠️ **New Bank Details Submitted** (to admins)
  - Trigger: When employee submits bank details
  - Type: `info`, Category: `bank`
  - Roles: `['admin', 'hr']` ⚠️ **ISSUE**: Wrong role names
  - Message: Notification to admins about new submission

- ✅ **Bank Details Verified/Rejected** (to employee)
  - Trigger: When admin verifies/rejects bank details
  - Type: `success`/`error`, Category: `bank`
  - Message: Verification status update

**Status**: ⚠️ **NEEDS FIX** - Role targeting issue

---

### 6. Admin Employee Management Controller
**File**: `backend/src/controllers/admin/employeeManagement.controller.js`

**Notifications Sent**:
- ✅ **Welcome to the Team** (to new employee)
  - Trigger: When new employee is created
  - Type: `success`, Category: `system`
  - Message: Welcome message for new employee

- ⚠️ **New Employee Added** (to admins)
  - Trigger: When new employee is created
  - Type: `info`, Category: `system`
  - Roles: `['admin', 'hr']` ⚠️ **ISSUE**: Wrong role names
  - Message: Notification about new employee

**Status**: ⚠️ **NEEDS FIX** - Role targeting issue

---

### 7. Admin Shift Controller
**File**: `backend/src/controllers/admin/shift.controller.js`

**Notifications Sent**:
- ✅ **New Shift Assignment** (to employee)
  - Trigger: When employee is assigned to shift
  - Type: `info`, Category: `shift`
  - Message: Shift assignment details

**Status**: ✅ **WORKING** - Properly implemented

---

### 8. Employee Leave Controller (Alternative)
**File**: `backend/src/controllers/employee/leave.controller.js`

**Notifications Sent**:
- ⚠️ **New Leave Application** (to admins)
  - Trigger: When employee applies for leave
  - Type: `info`, Category: `leave`
  - Roles: `['admin', 'hr']` ⚠️ **ISSUE**: Wrong role names
  - Message: Notification about new leave application

- ✅ **Leave Application Submitted** (to employee)
  - Trigger: When employee applies for leave
  - Type: `success`, Category: `leave`
  - Message: Submission confirmation

**Status**: ⚠️ **NEEDS FIX** - Role targeting issue

---

### 9. Employee Notifications Controller
**File**: `backend/src/controllers/employee/notifications.controller.js`

**Notifications Sent**:
- ✅ **Test Notification** (to user)
  - Trigger: Manual test endpoint
  - Type: `info`, Category: `system`
  - Message: Test notification for debugging

**Status**: ✅ **WORKING** - Test functionality only

---

## Issues Identified

### 1. Inconsistent Role Targeting ⚠️

**Problem**: Different controllers use different role names:
- ✅ **Correct**: `['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER']`
- ❌ **Incorrect**: `['admin', 'hr']` (these roles don't exist)

**Affected Controllers**:
- `employee/bankDetails.controller.js`
- `admin/employeeManagement.controller.js`
- `employee/leave.controller.js`

**Impact**: Notifications to admins are not being delivered because the role names don't match actual user roles in the database.

### 2. Duplicate Leave Controllers ⚠️

**Problem**: There are two leave controllers:
- `employee/leaveRequest.controller.js` (main, recently fixed)
- `employee/leave.controller.js` (alternative, has role issues)

**Impact**: Potential confusion and inconsistent behavior depending on which routes are used.

## Recommended Fixes

### 1. Fix Role Targeting in Bank Details Controller

```javascript
// In employee/bankDetails.controller.js
const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
await notificationService.sendToRoles(adminRoles, {
  // ... notification data
});
```

### 2. Fix Role Targeting in Employee Management Controller

```javascript
// In admin/employeeManagement.controller.js
const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
await notificationService.sendToRoles(adminRoles, {
  // ... notification data
});
```

### 3. Fix Role Targeting in Alternative Leave Controller

```javascript
// In employee/leave.controller.js
const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
await notificationService.sendToRoles(adminRoles, {
  // ... notification data
});
```

### 4. Standardize Role Constants

Create a shared constants file:
```javascript
// constants/roles.js
export const ADMIN_ROLES = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
export const ALL_ROLES = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'Employee', 'EMPLOYEE'];
```

## Notification Categories Summary

| Category | Purpose | Controllers Using |
|----------|---------|-------------------|
| `leave` | Leave requests and approvals | leaveRequest, leave |
| `attendance` | Attendance corrections | attendanceCorrection, attendanceCorrectionRequests |
| `bank` | Bank details verification | bankDetails |
| `shift` | Shift assignments | shift |
| `system` | System notifications | employeeManagement, notifications |

## Testing Recommendations

1. **Role Verification**: Run `check-user-roles-for-notifications.js` to verify actual roles in database
2. **Notification Testing**: Use `test-leave-notifications.js` to test notification delivery
3. **End-to-End Testing**: Test each notification flow manually
4. **SSE Connection Testing**: Verify real-time delivery via browser dev tools

## Priority Fixes

1. **HIGH**: Fix role targeting in bank details controller (affects bank verification notifications)
2. **HIGH**: Fix role targeting in employee management controller (affects new employee notifications)
3. **MEDIUM**: Fix role targeting in alternative leave controller (if still in use)
4. **LOW**: Standardize role constants across all controllers
5. **LOW**: Consider consolidating duplicate leave controllers