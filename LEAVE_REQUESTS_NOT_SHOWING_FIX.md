# Leave Requests Not Showing - Root Cause & Fix

## 🔍 Problem
HR/Admin users were seeing an empty array when accessing the Leave Management page, even though employees had submitted leave requests.

## 🎯 Root Cause Identified

### The Issue
The backend service was treating filter values literally instead of as "no filter" indicators.

**Frontend sends:**
```javascript
{
  status: 'all',
  leaveType: 'all',
  dateRange: 'all',
  search: '',
  page: 1,
  limit: 10
}
```

**Backend was querying:**
```sql
WHERE `LeaveRequest`.`status` = 'all' AND `LeaveRequest`.`leaveType` = 'all'
```

Since no leave requests have `status = 'all'` or `leaveType = 'all'` (they have actual values like 'pending', 'Casual', etc.), the query returned 0 results.

## ✅ Fix Applied

**File:** `backend/src/services/admin/leaveRequest.service.js`

### Before (❌ WRONG):
```javascript
// Apply filters
if (status) whereClause.status = status;
if (employeeId) whereClause.employeeId = employeeId;
if (leaveType) whereClause.leaveType = leaveType;
```

### After (✅ CORRECT):
```javascript
// Apply filters - only add to whereClause if not 'all'
if (status && status !== 'all') whereClause.status = status;
if (employeeId && employeeId !== 'all') whereClause.employeeId = employeeId;
if (leaveType && leaveType !== 'all') whereClause.leaveType = leaveType;
```

## 📊 How It Works Now

### When filters are 'all':
```sql
-- No WHERE clause for that filter
SELECT * FROM leave_requests
-- Returns ALL leave requests
```

### When filters have specific values:
```sql
-- WHERE clause is applied
SELECT * FROM leave_requests
WHERE status = 'pending' AND leaveType = 'Casual'
-- Returns filtered leave requests
```

## 🔧 Additional Improvements

Added comprehensive logging to help debug future issues:

```javascript
logger.info(`[LeaveRequest.getLeaveRequests] User: ${user.role}, Filters:`, filters);
logger.info(`[LeaveRequest.getLeaveRequests] Query whereClause:`, whereClause);
logger.info(`[LeaveRequest.getLeaveRequests] Employee filter:`, employeeFilter);
logger.info(`[LeaveRequest.getLeaveRequests] Found ${count} leave requests`);
```

## 🧪 Testing Steps

1. **Employee submits leave request**
   - Login as Employee
   - Go to "My Leave" page
   - Click "Apply for Leave"
   - Fill in details and submit
   - Should see success message

2. **HR views leave requests**
   - Login as HR/Admin
   - Go to "Leave Management" page
   - Should now see the submitted leave request
   - Employee name should display correctly

3. **Check browser console**
   - Open DevTools (F12)
   - Look for: `[RESPONSE SUCCESS] URL: /admin/leave/leave-requests`
   - Response should contain: `data: Array(1)` or more

4. **Check backend logs**
   - Look for: `[LeaveRequest.getLeaveRequests] Found X leave requests`
   - Should show count > 0

## 📋 Files Modified

- `backend/src/services/admin/leaveRequest.service.js` - Fixed filter logic

## 🚀 Expected Behavior After Fix

1. ✅ Employee submits leave → Request saved to database
2. ✅ HR opens Leave Management → Requests load from API
3. ✅ HR sees employee name → Displays correctly
4. ✅ HR can approve/reject → Status updates in real-time
5. ✅ Employee sees status → Updates in their leave history

## 🔗 Related Components

- **Frontend Service**: `frontend/src/core/services/leaveService.js`
  - Calls: `GET /api/admin/leave/leave-requests`
  
- **Frontend Store**: `frontend/src/stores/useLeaveStore.js`
  - Manages: Leave requests state and actions
  
- **Frontend Component**: `frontend/src/modules/leave/hr/LeaveManagement.jsx`
  - Displays: Leave requests list and actions
  
- **Backend Controller**: `backend/src/controllers/admin/leaveRequest.controller.js`
  - Handles: API requests
  
- **Backend Service**: `backend/src/services/admin/leaveRequest.service.js`
  - Implements: Business logic (NOW FIXED)

## 📝 Summary

The issue was a simple but critical bug where the backend was treating filter values literally instead of as "no filter" indicators. By adding a check for `!== 'all'`, the backend now correctly returns all leave requests when no specific filter is applied, and returns filtered results when specific values are provided.

This fix ensures that:
- HR/Admin can see all leave requests by default
- Filtering works correctly when specific values are selected
- The system is more intuitive and user-friendly