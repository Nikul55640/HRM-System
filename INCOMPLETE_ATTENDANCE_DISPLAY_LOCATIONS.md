# Where "Incomplete" Attendance is Displayed

## Overview
"Incomplete" status is shown when an employee has clocked in but hasn't clocked out yet (missing clock-out). This document shows all the places where this status is displayed.

---

## 1. 🟠 Employee Attendance Page (AttendancePage.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/employee/AttendancePage.jsx`

**Location**: Lines 270-290

**What Shows**:
- Orange alert card with "Incomplete attendance record detected"
- Message: "You have an incomplete attendance record. Please submit a correction request if needed."
- Badge showing "Incomplete" status

**When It Shows**:
- When `todayStats.hasIncompleteRecords === true`
- Only if it's not a holiday

**Code**:
```jsx
{/* Incomplete Records Alert - Only show if not a holiday */}
{!todayStats.isHoliday && todayStats.hasIncompleteRecords && (
  <Card className="border-l-4 border-l-orange-500 bg-orange-50">
    <CardContent className="py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-orange-800 text-sm sm:text-base">
              Incomplete attendance record detected
            </p>
            <p className="text-xs sm:text-sm text-orange-600 mt-1">
              You have an incomplete attendance record. Please submit a correction request if needed.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs flex-shrink-0">
          Incomplete
        </Badge>
      </div>
    </CardContent>
  </Card>
)}
```

---

## 2. ⏰ Enhanced Clock In/Out Component (EnhancedClockInOut.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/employee/EnhancedClockInOut.jsx`

**Location**: Lines 580-593

**What Shows**:
- Amber warning message: "Your shift ended at {shiftEndTime}. Don't forget to clock out!"
- Shows when shift end time has passed but employee hasn't clocked out

**When It Shows**:
- When employee is still active (clocked in)
- When current time is after shift end time
- When shift information is available

**Code**:
```jsx
{/* Missing clock-out warning */}
{isActive && todayRecord?.shift && (() => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const shiftEndTime = new Date(`${today} ${todayRecord.shift.shiftEndTime}`);
  const isAfterShiftEnd = now > shiftEndTime;
  
  return isAfterShiftEnd && (
    <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 text-center flex items-center justify-center gap-1">
      <Clock3 className="w-4 h-4" />
      Your shift ended at {todayRecord.shift.shiftEndTime}. Don't forget to clock out!
    </div>
  );
})()}
```

---

## 3. 📊 Monthly Attendance Calendar (MonthlyAttendanceCalendar.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/employee/MonthlyAttendanceCalendar.jsx`

**Location**: Lines 188-194 and 301-307

**What Shows**:
- Orange alert triangle icon
- Tooltip: "Incomplete (Missing clock out)"
- Displayed in calendar grid for days with incomplete status

**When It Shows**:
- When attendance record status is 'incomplete'
- In the calendar view for that specific day

**Code**:
```jsx
case 'incomplete':
  return { 
    icon: AlertTriangle, 
    color: 'text-amber-600', 
    tooltip: 'Incomplete (Missing clock out)'
  };
```

**Also Shows in Stats**:
- Count of incomplete records at bottom of calendar
- Lines 991-995:
```jsx
<div>
  <div className="font-medium text-gray-700">
    {monthlyAttendanceData.filter(r => r.status === 'incomplete').length}
  </div>
  <div className="text-gray-500">Incomplete</div>
</div>
```

---

## 4. 👨‍💼 Admin Manage Attendance (ManageAttendance.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/admin/ManageAttendance.jsx`

**Location**: Lines 437-446

**What Shows**:
- In table row: Orange background (`bg-orange-50`)
- Clock Out column shows: "Missing" in orange text
- Status filter option: "Incomplete" with label "Incomplete - Missing clock-out"

**When It Shows**:
- When viewing attendance records with 'incomplete' status
- In admin attendance management table

**Code**:
```jsx
<TableRow key={record.id} className={
  record.status === 'incomplete' ? 'bg-orange-50' : 
  record.status === 'holiday' ? 'bg-blue-50' : 
  record.isLate ? 'bg-red-50' : ''
}>
  {/* ... */}
  <TableCell>
    <div className={record.status === 'incomplete' ? 'text-orange-600 font-medium' : ''}>
      <div className="text-sm">
        {record.status === 'holiday' ? (
          <span className="text-blue-600">Holiday</span>
        ) : record.clockOut ? (
          formatTimeDisplay(record.clockOut)
        ) : record.status === 'incomplete' ? (
          <span className="text-orange-600">Missing</span>
        ) : (
          '--:--'
        )}
      </div>
    </div>
  </TableCell>
```

---

## 5. 📈 Live Attendance Dashboard (LiveAttendanceDashboard.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/admin/LiveAttendanceDashboard.jsx`

**Location**: Lines 295-300 and 417-424

**What Shows**:
- Stats card showing "Incomplete" count
- Subtitle: "Missing clock-out"
- Orange color indicator
- Status badge: "INCOMPLETE" with rotation icon

**When It Shows**:
- In live attendance dashboard
- Shows count of employees with incomplete records
- Shows individual employee status as "INCOMPLETE"

**Code**:
```jsx
<StatsCard
  title="Incomplete"
  value={summary.incomplete || 0}
  subtitle={summary.incomplete > 0 ? "Missing clock-out" : ""}
  icon={XCircle}
  color="orange"
/>

{/* In employee list */}
{employee.status === 'incomplete' && (
  <StatusBadge status="warning" size="sm">
    <div className="flex items-center gap-1">
      <RotateCcw className="w-3 h-3" />
      <span>INCOMPLETE</span>
    </div>
  </StatusBadge>
)}
```

---

## 6. 📅 Calendar Cell Component (CalendarCell.jsx)

**File**: `HRM-System/frontend/src/modules/calendar/components/CalendarCell.jsx`

**Location**: Lines 95-97 and 144-145

**What Shows**:
- Amber text color (`text-amber-600`)
- Clock icon
- Tooltip: "Incomplete - Missing clock out"

**When It Shows**:
- In calendar views when displaying incomplete records

**Code**:
```jsx
case 'incomplete':
  return 'text-amber-600';

case 'incomplete':
  return Clock;

case 'incomplete':
  return 'Incomplete - Missing clock out';
```

---

## 7. 📋 Session History View (SessionHistoryView.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/employee/SessionHistoryView.jsx`

**Location**: Lines 230-232

**What Shows**:
- Orange background badge (`bg-orange-100 text-orange-700`)
- Displayed in session history list

**When It Shows**:
- When viewing past attendance sessions with incomplete status

**Code**:
```jsx
: record.status === 'incomplete'
? 'bg-orange-100 text-orange-700'
: 'bg-gray-100 text-gray-700'
```

---

## 8. 📊 Employee Dashboard (EmployeeDashboard.jsx)

**File**: `HRM-System/frontend/src/modules/employee/pages/Dashboard/EmployeeDashboard.jsx`

**Location**: Lines 588-605

**What Shows**:
- Blue status badge showing "Working"
- Blue dot indicator
- Displayed when status is 'incomplete' or employee is clocked in

**When It Shows**:
- In dashboard calendar view
- When employee has incomplete attendance

**Code**:
```jsx
status === 'incomplete' || (isClockedIn && status !== 'leave' && status !== 'holiday') ? "bg-blue-100 text-blue-800" :

{status === 'incomplete' && 'Working'}
```

---

## 9. 🎨 Attendance Status Badge (AttendanceStatusBadge.jsx)

**File**: `HRM-System/frontend/src/shared/components/AttendanceStatusBadge.jsx`

**Location**: Line 17

**What Shows**:
- Clock icon for incomplete status
- Used in badge components throughout the app

**Code**:
```jsx
incomplete: Clock,
```

---

## 10. 📝 Attendance Form (AttendanceForm.jsx)

**File**: `HRM-System/frontend/src/modules/attendance/components/AttendanceForm.jsx`

**Location**: Line 43

**What Shows**:
- Dropdown option: "Incomplete"
- Available when manually setting attendance status

**Code**:
```jsx
{ value: 'incomplete', label: 'Incomplete' },
```

---

## Summary Table

| Component | File | Lines | Shows | Color |
|-----------|------|-------|-------|-------|
| Attendance Page | AttendancePage.jsx | 270-290 | Alert card | Orange |
| Clock In/Out | EnhancedClockInOut.jsx | 580-593 | Warning message | Amber |
| Monthly Calendar | MonthlyAttendanceCalendar.jsx | 188-194 | Icon + tooltip | Amber |
| Admin Manage | ManageAttendance.jsx | 437-446 | Table row | Orange |
| Live Dashboard | LiveAttendanceDashboard.jsx | 295-300 | Stats card | Orange |
| Calendar Cell | CalendarCell.jsx | 95-97 | Icon + color | Amber |
| Session History | SessionHistoryView.jsx | 230-232 | Badge | Orange |
| Dashboard | EmployeeDashboard.jsx | 588-605 | Status badge | Blue |
| Status Badge | AttendanceStatusBadge.jsx | 17 | Icon | - |
| Form | AttendanceForm.jsx | 43 | Dropdown | - |

---

## Key Information Displayed with "Incomplete"

### 1. **Shift End Time** (Most Important)
- Shown in EnhancedClockInOut.jsx (Line 590)
- Message: "Your shift ended at {shiftEndTime}. Don't forget to clock out!"
- This is the PRIMARY place where shift end time is shown with incomplete status

### 2. **Clock In Time**
- Shown in EnhancedClockInOut.jsx (Line 395)
- Displays when employee clocked in

### 3. **Worked Time**
- Shown in EnhancedClockInOut.jsx (Line 403)
- Shows how long employee has been working

### 4. **Break Sessions**
- Shown in EnhancedClockInOut.jsx (Lines 420-470)
- Lists all breaks taken during the day

### 5. **Status Indicators**
- Active/On Break status
- Late arrival status
- Work mode (Office/WFH/Hybrid/Field)

---

## How to Add Shift End Time Display

If you want to enhance the incomplete display to show more shift information, you can modify:

**File**: `HRM-System/frontend/src/modules/attendance/employee/AttendancePage.jsx`

**Current Code** (Lines 270-290):
```jsx
{/* Incomplete Records Alert - Only show if not a holiday */}
{!todayStats.isHoliday && todayStats.hasIncompleteRecords && (
  <Card className="border-l-4 border-l-orange-500 bg-orange-50">
    <CardContent className="py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-orange-800 text-sm sm:text-base">
              Incomplete attendance record detected
            </p>
            <p className="text-xs sm:text-sm text-orange-600 mt-1">
              You have an incomplete attendance record. Please submit a correction request if needed.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs flex-shrink-0">
          Incomplete
        </Badge>
      </div>
    </CardContent>
  </Card>
)}
```

**Enhanced Code** (To show shift end time):
```jsx
{/* Incomplete Records Alert - Only show if not a holiday */}
{!todayStats.isHoliday && todayStats.hasIncompleteRecords && (
  <Card className="border-l-4 border-l-orange-500 bg-orange-50">
    <CardContent className="py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-orange-800 text-sm sm:text-base">
              Incomplete attendance record detected
            </p>
            <p className="text-xs sm:text-sm text-orange-600 mt-1">
              You have an incomplete attendance record. 
              {todayRecord?.shift && ` Your shift ends at ${todayRecord.shift.shiftEndTime}.`}
              Please submit a correction request if needed.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs flex-shrink-0">
          Incomplete
        </Badge>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Related Files

- Backend Model: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`
- Backend Service: `HRM-System/backend/src/services/core/attendanceCalculation.service.js`
- Backend Controller: `HRM-System/backend/src/controllers/employee/attendance.controller.js`
- Frontend Store: `HRM-System/frontend/src/stores/useAttendanceSessionStore.js`
- Frontend Service: `HRM-System/frontend/src/services/attendanceService.js`

---

## Status Values

- `present` - Employee clocked in and out on time
- `absent` - No clock-in on working day
- `incomplete` - Clocked in but not clocked out (MISSING CLOCK-OUT)
- `leave` - Approved leave
- `half_day` - Half day work
- `holiday` - System holiday
- `pending_correction` - Awaiting correction approval

---

**Last Updated**: January 29, 2026
