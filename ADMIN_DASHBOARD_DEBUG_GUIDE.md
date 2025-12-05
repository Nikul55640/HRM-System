# Admin Dashboard - Debug & Testing Guide

## Issue Fixed ✅

**Problem**: Admin dashboard was showing 0 employees even though database had employee records.

**Root Cause**: Frontend was accessing wrong data path in API response.

**Backend Response Format**:
```javascript
{
  success: true,
  data: {
    employees: [...]  // ← Array is here
  }
}
```

**Frontend Was Looking For**: `response.data.data` (wrong)
**Should Be**: `response.data.data.employees` (correct)

---

## What Was Fixed

### File: `frontend/src/services/adminDashboardService.js`

**Before** ❌:
```javascript
const employees = employeesRes.value.data;  // Wrong path
const stats = {
  totalEmployees: employees?.data?.length || 0,  // Looking for data.data
};
```

**After** ✅:
```javascript
const employeesData = employeesRes.value.data?.data?.employees;  // Correct path
const stats = {
  totalEmployees: employeesData?.length || 0,  // Direct array access
};
```

---

## How to Test

### 1. Open Browser Console
Press `F12` or right-click → Inspect → Console tab

### 2. Navigate to Admin Dashboard
Login as admin and go to the dashboard

### 3. Check Console Logs

You should see:
```
📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...
📊 [ADMIN DASHBOARD SERVICE] Raw data received: { employees: 25, attendance: 0, leaves: 3 }
✅ [ADMIN DASHBOARD SERVICE] Stats calculated: { totalEmployees: 25, activeEmployees: 23, ... }
✅ [ADMIN DASHBOARD] Real data loaded successfully
```

### 4. Verify Dashboard Shows Real Numbers

Check these cards:
- **Total Employees**: Should show actual count from database
- **Active Employees**: Should show employees with status='active'
- **Pending Approvals**: Should show pending leave requests
- **Department Count**: Should show unique departments
- **New Hires This Month**: Should show employees hired this month

---

## Debugging Steps

### If Still Showing 0 Employees

#### Step 1: Check API Response
Open Network tab in browser DevTools:
1. Refresh dashboard
2. Look for request to `/api/employees`
3. Click on it → Preview tab
4. Check response structure

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "_id": "...",
        "employeeId": "EMP001",
        "fullName": "John Doe",
        "status": "active",
        "department": "IT",
        ...
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      ...
    }
  }
}
```

#### Step 2: Check Database
Run in MongoDB:
```javascript
db.employees.countDocuments()
db.employees.find({ status: 'active' }).count()
```

#### Step 3: Check Backend Logs
Look for:
```
👥 [EMPLOYEE] Fetching employees: { limit: 1000 }
✅ [EMPLOYEE] Employees fetched: { success: true, data: { employees: [...] } }
```

#### Step 4: Check User Permissions
Make sure logged-in user has:
- `EMPLOYEE.VIEW_ALL` permission
- Or is SuperAdmin/HR Administrator role

---

## Common Issues & Solutions

### Issue 1: "Access Denied" Message
**Cause**: User doesn't have admin permissions
**Solution**: 
- Login with admin account
- Or grant `EMPLOYEE.VIEW_ALL` permission to user

### Issue 2: Network Error
**Cause**: Backend not running or wrong API URL
**Solution**:
- Check backend is running: `cd backend && npm start`
- Check API base URL in `frontend/src/services/api.js`

### Issue 3: Empty Array Returned
**Cause**: No employees in database
**Solution**:
- Add employees through the UI
- Or run seed script: `cd backend && npm run seed`

### Issue 4: CORS Error
**Cause**: Frontend and backend on different ports without CORS
**Solution**:
- Check `backend/src/app.js` has CORS enabled
- Check `frontend/.env` has correct `VITE_API_URL`

---

## API Endpoints Being Called

### 1. Get Employees
```
GET /api/employees?limit=1000
Headers: Authorization: Bearer <token>
```

### 2. Get Attendance (Optional)
```
GET /api/admin/attendance?limit=1
Headers: Authorization: Bearer <token>
```

### 3. Get Leave Requests
```
GET /api/admin/leave-requests?status=pending
Headers: Authorization: Bearer <token>
```

---

## Expected Console Output

### Success Case ✅
```
📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...
👥 [EMPLOYEE] Fetching employees: { limit: 1000 }
✅ [EMPLOYEE] Employees fetched: { success: true, data: { employees: [25 items] } }
📊 [ADMIN DASHBOARD SERVICE] Raw data received: { employees: 25, attendance: 0, leaves: 3 }
✅ [ADMIN DASHBOARD SERVICE] Stats calculated: {
  totalEmployees: 25,
  activeEmployees: 23,
  onLeaveToday: 2,
  pendingApprovals: 3,
  departmentCount: 5,
  newHiresThisMonth: 2
}
✅ [ADMIN DASHBOARD] Real data loaded successfully
```

### Error Case ❌
```
📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...
❌ [EMPLOYEE] Failed to fetch employees: Network Error
❌ [ADMIN DASHBOARD SERVICE] Failed to fetch dashboard: Network Error
❌ [ADMIN DASHBOARD] Failed to fetch data: Network Error
```

---

## Quick Verification Checklist

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] Logged in as admin user
- [ ] Database has employee records
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Dashboard displays numbers > 0
- [ ] Numbers match database counts

---

## Manual Test Data

If you need test data, create employees via API or UI:

```javascript
// Example employee
{
  "employeeId": "EMP001",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "department": "IT",
  "jobTitle": "Software Engineer",
  "status": "active",
  "hireDate": "2024-01-15"
}
```

---

## Still Not Working?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Restart both servers**: Stop and start backend & frontend
3. **Check .env files**: Make sure API URLs are correct
4. **Check MongoDB**: Make sure database is running and accessible
5. **Check user role**: Make sure you're logged in as admin

---

## Success Indicators

✅ Console shows "Real data loaded successfully"
✅ Employee count > 0
✅ Active employees count > 0
✅ Department count > 0
✅ No red errors in console
✅ Network tab shows 200 OK responses

---

## Next Steps After Verification

Once dashboard shows real data:
1. Test with different admin users
2. Test with different employee counts
3. Test leave request counts
4. Test department filtering
5. Test refresh functionality

