# Leave Management System - Complete Guide

## Overview
The HRM system has a complete leave management workflow for employees to apply for leave and HR/Admin to approve/reject requests.

---

## 🔄 Complete Leave Workflow

### **Step 1: HR Assigns Leave Balance to Employee**

**Location**: Admin Dashboard → Leave Management → "Assign Leave" button

**Process**:
1. HR clicks "Assign Leave"
2. Selects an employee from the list
3. Enters leave allocations:
   - **Annual Leave**: e.g., 20 days
   - **Sick Leave**: e.g., 10 days
   - **Casual Leave** (Personal): e.g., 5 days
   - **Unpaid Leave**: e.g., 0 days
4. Clicks "Assign" or "Update"

**What happens in backend**:
- Creates/updates `LeaveBalance` record for the employee
- Sets `allocated` days for each leave type
- Calculates `available` = `allocated` - `used` - `pending`

**API**: `POST /api/admin/leave/assign/:employeeId`

---

### **Step 2: Employee Applies for Leave**

**Location**: Employee Dashboard → My Leave → "Apply Leave" button

**Process**:
1. Employee clicks "Apply Leave"
2. Fills out the form:
   - **Leave Type**: Annual, Sick, Personal, etc.
   - **Start Date**: When leave starts
   - **End Date**: When leave ends
   - **Reason**: Why they need leave
   - **Half Day**: Optional (morning/afternoon)
3. Clicks "Submit"

**What happens in backend**:
- Creates `LeaveRequest` with status "pending"
- Updates `LeaveBalance`:
  - Adds days to `pending` count
  - Reduces `available` count
  - Adds entry to `history` array
- Sends notification to HR/Manager

**API**: `POST /api/employee/leave`

---

### **Step 3: HR/Admin Reviews Leave Request**

**Location**: Admin Dashboard → Leave Management → "Leave Requests" tab

**What's displayed**:
- Table showing all leave requests
- Columns: Employee Name, Leave Type, Start Date, End Date, Days, Status
- Filter by: Status (pending/approved/rejected), Type, Date range
- Search by: Employee name

**Actions**:

#### **Approve Leave**
1. HR clicks "Approve" button
2. Optionally adds comments
3. System:
   - Changes status to "approved"
   - Moves days from `pending` to `used` in LeaveBalance
   - Creates attendance records for leave dates
   - Sends notification to employee
   - Logs audit trail

**API**: `PUT /api/admin/leave-requests/:id/approve`

#### **Reject Leave**
1. HR clicks "Reject" button
2. Enters rejection reason (required)
3. System:
   - Changes status to "rejected"
   - Returns days from `pending` back to `available`
   - Sends notification to employee with reason
   - Logs audit trail

**API**: `PUT /api/admin/leave-requests/:id/reject`

---

## 📊 Leave Balance Structure

```javascript
{
  employeeId: ObjectId,
  year: 2024,
  leaveTypes: [
    {
      type: 'annual',
      allocated: 20,    // Total days assigned by HR
      used: 5,          // Days already taken (approved leaves)
      pending: 2,       // Days in pending requests
      available: 13     // allocated - used - pending
    },
    {
      type: 'sick',
      allocated: 10,
      used: 1,
      pending: 0,
      available: 9
    }
  ]
}
```

---

## 🔐 Permissions Required

### HR/Admin Permissions:
- `LEAVE.VIEW_ALL` - View all leave requests
- `LEAVE.MANAGE_BALANCE` - Assign/update leave balances
- `LEAVE.APPROVE_ANY` - Approve/reject any leave request

### Employee Permissions:
- `LEAVE.VIEW_OWN` - View own leave balance and history
- `LEAVE.CREATE_OWN` - Apply for leave
- `LEAVE.CANCEL_OWN` - Cancel pending leave requests

---

## 🐛 Fixed Issues

### Issue 1: Leave Requests Not Showing
**Problem**: Frontend was calling wrong API endpoint
**Fix**: Updated `leaveService.js`:
- Changed `/admin/leave` → `/admin/leave-requests`
- Changed `/admin/leave/:id/approve` → `/admin/leave-requests/:id/approve`
- Changed `/admin/leave/:id/reject` → `/admin/leave-requests/:id/reject`

### Issue 2: Leave Balance Assignment Missing
**Problem**: No backend routes for assigning leave balances
**Fix**: Created:
- `leaveBalanceController.js` - Controller for balance management
- Added routes to `leaveRequestRoutes.js`:
  - `GET /api/admin/leave/balances` - Get all balances
  - `POST /api/admin/leave/assign/:employeeId` - Assign balance

---

## 📝 API Endpoints Summary

### Employee Endpoints
```
GET    /api/employee/leave/balance          - Get my leave balance
GET    /api/employee/leave                  - Get my leave history
POST   /api/employee/leave                  - Apply for leave
DELETE /api/employee/leave/:id              - Cancel leave request
```

### Admin Endpoints
```
GET    /api/admin/leave/balances            - Get all employees' balances
POST   /api/admin/leave/assign/:employeeId  - Assign leave balance
GET    /api/admin/leave-requests            - Get all leave requests
GET    /api/admin/leave-requests/:id        - Get specific request
PUT    /api/admin/leave-requests/:id/approve - Approve request
PUT    /api/admin/leave-requests/:id/reject  - Reject request
GET    /api/admin/leave-requests/statistics - Get leave statistics
```

---

## ✅ Testing Checklist

1. **As HR**:
   - [ ] Can view Leave Management page
   - [ ] Can see "Leave Balances" tab
   - [ ] Can see "Leave Requests" tab
   - [ ] Can click "Assign Leave" button
   - [ ] Can assign leave to an employee
   - [ ] Can see all pending leave requests
   - [ ] Can approve a leave request
   - [ ] Can reject a leave request with reason

2. **As Employee**:
   - [ ] Can view My Leave page
   - [ ] Can see leave balance (Annual, Sick, etc.)
   - [ ] Can click "Apply Leave" button
   - [ ] Can submit leave request
   - [ ] Can see leave request in history with "pending" status
   - [ ] Receives notification when leave is approved/rejected
   - [ ] Can cancel pending leave request

3. **System Behavior**:
   - [ ] Leave balance updates when request is submitted (pending increases)
   - [ ] Leave balance updates when request is approved (used increases, pending decreases)
   - [ ] Leave balance updates when request is rejected (available increases, pending decreases)
   - [ ] Attendance records created when leave is approved
   - [ ] Notifications sent to employee on approval/rejection
   - [ ] Audit logs created for all actions

---

## 🎯 Next Steps

If leave requests still don't show:
1. Check browser console for API errors
2. Check backend logs for permission errors
3. Verify user has correct role and permissions
4. Test API endpoints directly using Postman/Thunder Client
5. Check database for existing LeaveRequest documents

