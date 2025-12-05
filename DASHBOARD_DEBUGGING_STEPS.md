# Dashboard Debugging Steps - Real-Time Help

## Current Issue
Dashboard shows 0 for all values even after the fix.

## Immediate Debugging Steps

### Step 1: Open Browser Console
1. Press `F12` on your keyboard
2. Click on the **Console** tab
3. Refresh the admin dashboard page

### Step 2: Look for These Logs

You should see logs like this:

```
📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...
🔍 [DEBUG] Employees Response: { status: 'fulfilled', fullData: {...} }
🔍 [DEBUG] Attendance Response: { status: 'fulfilled', fullData: {...} }
🔍 [DEBUG] Leaves Response: { status: 'fulfilled', fullData: {...} }
📊 [ADMIN DASHBOARD SERVICE] Extracted data: { employeesData: [...], employeesLength: X }
✅ [ADMIN DASHBOARD SERVICE] Stats calculated: { totalEmployees: X, ... }
```

### Step 3: Check What You See

#### Scenario A: You see "rejected" status
```
🔍 [DEBUG] Employees Response: { status: 'rejected', fullData: Error: ... }
```
**Problem**: API call failed
**Solutions**:
- Check if backend is running
- Check if you're logged in
- Check if user has permissions

#### Scenario B: You see "fulfilled" but fullData is empty
```
🔍 [DEBUG] Employees Response: { 
  status: 'fulfilled', 
  fullData: { success: true, data: { employees: [] } }
}
```
**Problem**: No employees in database
**Solution**: Add employees through the UI or seed script

#### Scenario C: You see data but wrong structure
```
🔍 [DEBUG] Employees Response: { 
  status: 'fulfilled', 
  fullData: { success: true, data: [...] }  // ← Wrong! Should be data: { employees: [...] }
}
```
**Problem**: Backend response structure is different
**Solution**: Need to adjust the data extraction path

---

## Quick Fixes

### Fix 1: Check Backend is Running
```bash
cd backend
npm start
```
Should show: `Server running on port 5000`

### Fix 2: Check Database Has Data
Open MongoDB Compass or run:
```javascript
// In MongoDB shell
use hrm_system
db.employees.countDocuments()
```
Should return a number > 0

### Fix 3: Check User Permissions
Make sure you're logged in as:
- SuperAdmin
- HR Administrator
- HR Manager

### Fix 4: Check API URL
Check `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## What to Send Me

If still not working, send me the console output of:

1. **The full Employees Response log**:
```
🔍 [DEBUG] Employees Response: { ... }
```

2. **The Extracted data log**:
```
📊 [ADMIN DASHBOARD SERVICE] Extracted data: { ... }
```

3. **Any error messages** in red

---

## Common Issues & Solutions

### Issue 1: "Network Error"
**Cause**: Backend not running or wrong URL
**Fix**: 
```bash
cd backend
npm start
```

### Issue 2: "401 Unauthorized"
**Cause**: Not logged in or token expired
**Fix**: Logout and login again

### Issue 3: "403 Forbidden"
**Cause**: User doesn't have permissions
**Fix**: Login with admin account

### Issue 4: Empty array but database has data
**Cause**: Wrong data path in code
**Fix**: Check the console logs and send me the structure

---

## Test API Directly

You can test the API directly in browser console:

```javascript
// Open console (F12) and paste this:
fetch('http://localhost:5000/api/employees?limit=10', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
```

This will show you exactly what the API returns.

---

## Expected Console Output (Success)

```
📊 [ADMIN DASHBOARD SERVICE] Fetching admin dashboard data...

🔍 [DEBUG] Employees Response: {
  status: 'fulfilled',
  fullData: {
    success: true,
    data: {
      employees: [
        { _id: '...', employeeId: 'EMP001', fullName: 'John Doe', status: 'active', ... },
        { _id: '...', employeeId: 'EMP002', fullName: 'Jane Smith', status: 'active', ... },
        // ... more employees
      ],
      pagination: { total: 25, page: 1, ... }
    }
  }
}

📊 [ADMIN DASHBOARD SERVICE] Extracted data: {
  employeesData: [Array(25)],
  employeesLength: 25,
  attendanceData: null,
  leavesData: null
}

✅ [ADMIN DASHBOARD SERVICE] Stats calculated: {
  totalEmployees: 25,
  activeEmployees: 23,
  onLeaveToday: 0,
  pendingApprovals: 0,
  departmentCount: 5,
  newHiresThisMonth: 2,
  pendingDocuments: 0
}

✅ [ADMIN DASHBOARD] Real data loaded successfully
```

---

## Next Steps

1. **Refresh the dashboard** with console open (F12)
2. **Copy the console logs** (especially the DEBUG logs)
3. **Send me the logs** so I can see exactly what's happening
4. **Check the Network tab** (F12 → Network) to see the actual API responses

The DEBUG logs I added will show us exactly what data structure the API is returning, and we can fix it from there!

