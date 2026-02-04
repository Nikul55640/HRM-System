# Leave Blocking Implementation

## ✅ **COMPLETED: Prevent Clock-In on Leave Days**

### **Overview**
Implemented comprehensive leave blocking functionality to prevent employees from clocking in when they are on approved leave, similar to the weekend blocking system.

### **Backend Changes**

#### **1. Updated `attendance.service.js` - clockIn method**
- **File**: `HRM-System/backend/src/services/admin/attendance.service.js`
- **Changes**:
  - Added leave check before allowing clock-in
  - Queries `LeaveRequest` table for approved leaves covering today's date
  - Returns detailed error message with leave type and period
  - Prevents attendance record creation on leave days

```javascript
// Check if employee is on approved leave today
const approvedLeave = await LeaveRequest.findOne({
    where: {
        employeeId: user.employee?.id,
        status: 'approved',
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today }
    }
});

if (approvedLeave) {
    throw { 
        message: `Cannot clock in today. You are on approved ${leaveType} leave (${leavePeriod}). Please contact HR if this is incorrect.`, 
        statusCode: 400 
    };
}
```

#### **2. Updated `attendance.service.js` - getButtonStates method**
- **File**: `HRM-System/backend/src/services/admin/attendance.service.js`
- **Changes**:
  - Added leave check to disable all attendance buttons on leave days
  - Returns comprehensive leave information for frontend display
  - Provides detailed leave status and period information

```javascript
if (approvedLeave) {
    return {
        success: true,
        data: {
            clockIn: { enabled: false, reason: `Cannot clock in today. ${leaveMessage}` },
            clockOut: { enabled: false, reason: `Cannot clock out today. ${leaveMessage}` },
            startBreak: { enabled: false, reason: `Cannot start break today. ${leaveMessage}` },
            endBreak: { enabled: false, reason: `Cannot end break today. ${leaveMessage}` },
            currentStatus: 'on_leave',
            isOnLeave: true,
            leaveInfo: {
                type: leaveType,
                startDate: approvedLeave.startDate,
                endDate: approvedLeave.endDate,
                period: leavePeriod
            },
            leaveMessage: leaveMessage
        }
    };
}
```

### **Frontend Changes**

#### **3. Updated `EnhancedClockInOut.jsx`**
- **File**: `HRM-System/frontend/src/modules/attendance/employee/EnhancedClockInOut.jsx`
- **Changes**:
  - Added leave message display component
  - Shows leave type, period, and status
  - Provides clear visual indication when on leave
  - Matches weekend message styling for consistency

```jsx
{/* Leave Message */}
{buttonStates.isOnLeave && (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      <Coffee className="h-5 w-5 text-green-600" />
      <span className="font-medium text-green-800">On Leave</span>
    </div>
    <p className="text-green-700 text-sm">
      {buttonStates.leaveMessage || 'You are on approved leave today.'}
    </p>
    {buttonStates.leaveInfo && (
      <div className="mt-2 text-xs text-green-600">
        <div className="font-medium">{buttonStates.leaveInfo.type} Leave</div>
        <div>{buttonStates.leaveInfo.period}</div>
      </div>
    )}
  </div>
)}
```

### **How It Works**

#### **Leave Detection Logic**
1. **Database Query**: Checks `leave_requests` table for approved leaves
2. **Date Range Check**: Uses `startDate <= today <= endDate` to find overlapping leaves
3. **Status Validation**: Only considers leaves with `status = 'approved'`
4. **Real-time Check**: Performed on every clock-in attempt and button state refresh

#### **User Experience**
1. **Clock-In Prevention**: Employee cannot clock in on leave days
2. **Clear Messaging**: Shows leave type, dates, and helpful instructions
3. **Button Disabling**: All attendance buttons are disabled with explanatory tooltips
4. **Visual Indicators**: Green-themed leave message box for clear identification

#### **Error Messages**
- **Clock-In Attempt**: `"Cannot clock in today. You are on approved Casual leave (Jan 15, 2024 - Jan 17, 2024). Please contact HR if this is incorrect."`
- **Button Tooltips**: `"Cannot clock in today. You are on approved Casual leave (Jan 15, 2024 - Jan 17, 2024). Attendance tracking is disabled."`

### **Integration with Existing Systems**

#### **Leave Management**
- ✅ Works with existing `LeaveRequest` model
- ✅ Supports all leave types: Casual, Sick, Paid
- ✅ Handles single-day and multi-day leaves
- ✅ Respects leave approval workflow

#### **Attendance Finalization**
- ✅ Finalization job already has `isEmployeeOnApprovedLeave` helper
- ✅ Automatically creates 'leave' status records for approved leaves
- ✅ No additional changes needed for finalization

#### **Weekend + Leave Blocking**
- ✅ Both weekend and leave blocking work together
- ✅ Weekend check runs first, then leave check
- ✅ Consistent error handling and user experience

### **Testing Scenarios**

#### **Positive Cases**
1. ✅ Employee on approved leave cannot clock in
2. ✅ All attendance buttons disabled on leave days
3. ✅ Clear leave information displayed
4. ✅ Works for single-day and multi-day leaves
5. ✅ Works for all leave types (Casual, Sick, Paid)

#### **Edge Cases**
1. ✅ Leave starting today (startDate = today)
2. ✅ Leave ending today (endDate = today)
3. ✅ Multi-day leave spanning today
4. ✅ Multiple overlapping leaves (uses first found)
5. ✅ Leave status changes (only approved leaves block)

### **Database Impact**
- **Queries Added**: 1 additional query per clock-in attempt and button state check
- **Performance**: Minimal impact - indexed query on employeeId and dates
- **No Schema Changes**: Uses existing LeaveRequest table structure

### **Security Considerations**
- ✅ Server-side validation prevents bypass attempts
- ✅ Employee can only see their own leave information
- ✅ Leave status checked in real-time (no caching issues)
- ✅ Consistent with existing role-based access control

## 🎯 **Result**

Employees can no longer clock in when they are on approved leave. The system provides clear feedback about their leave status and prevents any attendance tracking during leave periods. This ensures accurate attendance records and prevents conflicts between leave and attendance data.

**Combined with weekend blocking, the system now prevents attendance on:**
- ✅ Weekends (Saturday/Sunday by default)
- ✅ Approved leave days (any leave type)
- ✅ Holidays (existing functionality)

The implementation is consistent, user-friendly, and maintains data integrity across the HRM system.