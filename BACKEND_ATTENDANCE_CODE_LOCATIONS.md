# Backend Attendance Code Locations - Quick Reference

## 📍 Where Each Calculation Happens

### 1. 🔴 LATE CALCULATION

**File**: `HRM-System/backend/src/services/core/attendanceCalculation.service.js`

**Method**: `calculateLateStatus(clockInTime, shift, attendanceDate)`

**Lines**: ~30-120

**What it does**:
```javascript
// Input
clockInTime = "2026-01-29T09:15:00Z"
shift = { shiftStartTime: "09:00", gracePeriodMinutes: 5 }
attendanceDate = "2026-01-29"

// Process
1. Parse shift start time: "09:00" → 09:00
2. Create shift start: 2026-01-29 09:00:00
3. Add grace period: 09:00 + 5 min = 09:05
4. Compare: 09:15 > 09:05 → LATE
5. Calculate: 09:15 - 09:05 = 10 minutes

// Output
{
  isLate: true,
  lateMinutes: 10,
  shiftStartTime: 2026-01-29T09:00:00Z,
  lateThreshold: 2026-01-29T09:05:00Z
}
```

**Called from**:
- `HRM-System/backend/src/controllers/employee/attendance.controller.js` (Clock-in endpoint)
- `HRM-System/backend/src/jobs/attendanceFinalization.js` (Finalization job)

---

### 2. ⏱️ WORK HOURS CALCULATION

**File**: `HRM-System/backend/src/services/core/attendanceCalculation.service.js`

**Method**: `calculateWorkHours(clockIn, clockOut, breakSessions)`

**Lines**: ~122-160

**What it does**:
```javascript
// Input
clockIn = "2026-01-29T09:15:00Z"
clockOut = "2026-01-29T17:30:00Z"
breakSessions = [
  { breakIn: "2026-01-29T10:30:00Z", breakOut: "2026-01-29T10:45:00Z" },
  { breakIn: "2026-01-29T13:00:00Z", breakOut: "2026-01-29T13:30:00Z" }
]

// Process
1. Total time: 17:30 - 09:15 = 495 minutes
2. Break 1: 10:45 - 10:30 = 15 minutes
3. Break 2: 13:30 - 13:00 = 30 minutes
4. Total breaks: 45 minutes
5. Work time: 495 - 45 = 450 minutes

// Output
{
  workMinutes: 450,
  breakMinutes: 45,
  totalWorkTimeMs: 27000000
}
```

**Called from**:
- `HRM-System/backend/src/jobs/attendanceFinalization.js` (Finalization)
- `HRM-System/backend/src/models/sequelize/AttendanceRecord.js` (finalizeWithShift method)

---

### 3. ⚠️ INCOMPLETE STATUS MARKING

**File**: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

**Method**: `markMissedClockOuts(date)`

**Lines**: ~280-310

**What it does**:
```javascript
// Finds all records where:
// - Date matches
// - clockIn exists (employee clocked in)
// - clockOut is NULL (employee did NOT clock out)
// - Status is NOT 'leave' or 'holiday'

// Updates them to:
// - status: 'pending_correction'
// - statusReason: 'Missed clock-out - requires correction'

// SQL equivalent:
UPDATE attendance_records
SET status = 'pending_correction',
    statusReason = 'Missed clock-out - requires correction'
WHERE date = '2026-01-29'
  AND clockIn IS NOT NULL
  AND clockOut IS NULL
  AND status NOT IN ('leave', 'holiday')
```

**Called from**:
- `HRM-System/backend/src/jobs/attendanceFinalization.js` (Finalization job)

---

### 4. ❌ ABSENT MARKING

**File**: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

**Method**: `markAbsentForNoClockIn(date)`

**Lines**: ~312-330

**What it does**:
```javascript
// Finds all records where:
// - Date matches
// - clockIn is NULL (employee did NOT clock in)
// - Status is NOT 'leave' or 'holiday'

// Updates them to:
// - status: 'absent'
// - statusReason: 'No attendance recorded'

// SQL equivalent:
UPDATE attendance_records
SET status = 'absent',
    statusReason = 'No attendance recorded'
WHERE date = '2026-01-29'
  AND clockIn IS NULL
  AND status NOT IN ('leave', 'holiday')
```

**Called from**:
- `HRM-System/backend/src/jobs/attendanceFinalization.js` (Finalization job)

---

### 5. 📊 FINAL STATUS DETERMINATION

**File**: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

**Method**: `finalizeWithShift(shift)`

**Lines**: ~360-430

**What it does**:
```javascript
// Input
shift = {
  fullDayHours: 8,
  halfDayHours: 4
}

// Process
1. Calculate work hours using AttendanceCalculationService
2. Compare with shift thresholds:
   - If workHours >= 8 → status = 'present'
   - If workHours >= 4 → status = 'half_day'
   - If workHours < 4 → status = 'half_day'

// Example
workHours = 7.5
7.5 >= 4 AND 7.5 < 8 → status = 'half_day'

// Output
{
  status: 'half_day',
  halfDayType: 'full_day',
  statusReason: 'Worked 7.5 hours (≥ 4 for half day, < 8 for full day)',
  workHours: 7.5,
  totalWorkedMinutes: 450,
  totalBreakMinutes: 45
}
```

**Called from**:
- `HRM-System/backend/src/jobs/attendanceFinalization.js` (Finalization job)

---

### 6. ⏳ OVERTIME CALCULATION

**File**: `HRM-System/backend/src/services/core/attendanceCalculation.service.js`

**Method**: `calculateOvertime(workMinutes, shift)`

**Lines**: ~195-205

**What it does**:
```javascript
// Input
workMinutes = 540  // 9 hours
shift = { fullDayHours: 8 }

// Process
fullDayMinutes = 8 * 60 = 480
overtimeMinutes = 540 - 480 = 60

// Output
overtimeMinutes = 60  // 1 hour overtime
```

**Called from**:
- `HRM-System/backend/src/models/sequelize/AttendanceRecord.js` (finalizeWithShift)

---

## 🔄 DAILY FINALIZATION JOB

**File**: `HRM-System/backend/src/jobs/attendanceFinalization.js`

**What it does** (Runs daily, usually at 00:30 AM):

```javascript
// 1. Get all records from yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

// 2. For each record:
records.forEach(record => {
  // Check if incomplete (clockIn but NO clockOut)
  if (record.clockIn && !record.clockOut) {
    // Mark as pending_correction
    AttendanceRecord.markMissedClockOuts(yesterday);
  }
  
  // Check if absent (NO clockIn)
  if (!record.clockIn) {
    // Mark as absent
    AttendanceRecord.markAbsentForNoClockIn(yesterday);
  }
  
  // If has both clockIn and clockOut
  if (record.clockIn && record.clockOut) {
    // Finalize status
    record.finalizeWithShift(shift);
  }
});

// 3. Log results
console.log(`Finalized ${count} records`);
```

---

## 📋 ATTENDANCE RECORD MODEL

**File**: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

### Key Fields

```javascript
// Clock times
clockIn: DATE              // When clocked in
clockOut: DATE             // When clocked out

// Late tracking
isLate: BOOLEAN            // Is late?
lateMinutes: INTEGER       // How many minutes late

// Work hours
totalWorkedMinutes: INTEGER    // Minutes worked (excluding breaks)
workHours: DECIMAL(4,2)        // Hours worked (e.g., 7.50)
totalBreakMinutes: INTEGER     // Total break time

// Status (MOST IMPORTANT)
status: ENUM(
  'present',              // ✅ Full day (≥ 8 hours)
  'absent',               // ❌ No clock-in
  'leave',                // 📅 Approved leave
  'half_day',             // ⏱️ 4-8 hours
  'holiday',              // 🎉 System holiday
  'incomplete',           // ⚠️ Clocked in, NOT clocked out
  'pending_correction'    // 🔄 Awaiting correction
)

// Overtime
overtimeMinutes: INTEGER   // Minutes over shift
overtimeHours: DECIMAL     // Hours over shift

// Breaks
breakSessions: JSON        // Array of break sessions
```

---

## 🎯 CONTROLLER ENDPOINTS

**File**: `HRM-System/backend/src/controllers/employee/attendance.controller.js`

### Clock In
```javascript
POST /api/employee/attendance/clock-in
{
  location: { lat, lng },
  workMode: "office"
}

// Creates/updates record:
// - clockIn: current time
// - status: "incomplete"
// - Calls: calculateLateStatus()
// - Updates: isLate, lateMinutes
```

### Clock Out
```javascript
POST /api/employee/attendance/clock-out

// Updates record:
// - clockOut: current time
// - Calls: calculateWorkHours()
// - Updates: totalWorkedMinutes, workHours
// - Status still "incomplete" until finalization
```

### Start Break
```javascript
POST /api/employee/attendance/start-break

// Updates record:
// - breakSessions[].breakIn: current time
```

### End Break
```javascript
POST /api/employee/attendance/end-break

// Updates record:
// - breakSessions[].breakOut: current time
// - breakSessions[].duration: calculated
// - totalBreakMinutes: recalculated
```

---

## 🔍 ADMIN ENDPOINTS

**File**: `HRM-System/backend/src/controllers/admin/attendance.controller.js`

### Get Attendance Records
```javascript
GET /api/admin/attendance?date=2026-01-29&status=incomplete

// Returns all records with:
// - status: "incomplete" (missing clock-out)
// - Can filter by date, employee, status
```

### Update Attendance
```javascript
PUT /api/admin/attendance/:id
{
  clockOut: "2026-01-29T17:30:00Z",
  status: "present"
}

// Admin can manually:
// - Set clock-out time
// - Change status
// - Add remarks
```

---

## 📊 MONTHLY SUMMARY

**File**: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

**Method**: `getMonthlySummary(employeeId, year, month)`

**Lines**: ~240-280

**Returns**:
```javascript
{
  totalDays: 22,
  presentDays: 18,
  leaveDays: 2,
  absentDays: 1,
  halfDays: 1,
  holidayDays: 0,
  totalWorkHours: 144.5,
  totalOvertimeHours: 4.5,
  lateDays: 3,
  earlyDepartures: 1,
  totalLateMinutes: 25,
  totalEarlyExitMinutes: 45,
  incompleteDays: 0,
  totalBreakMinutes: 450,
  totalWorkedMinutes: 8670,
  averageWorkHours: 6.57,
  includesLiveSession: false
}
```

---

## 🔗 CALL FLOW

```
Employee Clock In
    ↓
attendance.controller.js → clockIn()
    ↓
Create/Update AttendanceRecord
    ↓
AttendanceCalculationService.calculateLateStatus()
    ↓
Update: isLate, lateMinutes
    ↓
Save to database
    ↓
Return to frontend

---

Employee Clock Out
    ↓
attendance.controller.js → clockOut()
    ↓
Update AttendanceRecord.clockOut
    ↓
AttendanceCalculationService.calculateWorkHours()
    ↓
Update: totalWorkedMinutes, workHours
    ↓
Save to database
    ↓
Return to frontend

---

Next Day (00:30 AM)
    ↓
attendanceFinalization.js → run()
    ↓
Get all records from yesterday
    ↓
For each record:
  ├─ If clockIn && !clockOut
  │  └─ markMissedClockOuts() → status = 'pending_correction'
  ├─ If !clockIn
  │  └─ markAbsentForNoClockIn() → status = 'absent'
  └─ If clockIn && clockOut
     └─ finalizeWithShift() → status = 'present' or 'half_day'
    ↓
Log results
```

---

## 📁 File Structure

```
backend/src/
├── models/sequelize/
│   ├── AttendanceRecord.js          ← Database schema + methods
│   └── EmployeeShift.js             ← Shift configuration
│
├── services/core/
│   └── attendanceCalculation.service.js  ← All calculations
│
├── controllers/
│   ├── employee/
│   │   └── attendance.controller.js  ← Employee endpoints
│   └── admin/
│       └── attendance.controller.js  ← Admin endpoints
│
├── jobs/
│   └── attendanceFinalization.js    ← Daily finalization
│
└── routes/
    └── employee/
        └── attendance.routes.js     ← Route definitions
```

---

## 🎯 Key Code Snippets

### Calculate Late
```javascript
// File: attendanceCalculation.service.js
const lateStatus = AttendanceCalculationService.calculateLateStatus(
  clockInTime,
  shift,
  attendanceDate
);
```

### Calculate Work Hours
```javascript
// File: attendanceCalculation.service.js
const workHours = AttendanceCalculationService.calculateWorkHours(
  clockIn,
  clockOut,
  breakSessions
);
```

### Mark Incomplete
```javascript
// File: AttendanceRecord.js
await AttendanceRecord.markMissedClockOuts(date);
```

### Finalize Status
```javascript
// File: AttendanceRecord.js
await record.finalizeWithShift(shift);
```

---

## 🔍 How to Find Specific Logic

### "Where is late calculated?"
→ `attendanceCalculation.service.js` → `calculateLateStatus()`

### "Where is incomplete marked?"
→ `AttendanceRecord.js` → `markMissedClockOuts()`

### "Where is work hours calculated?"
→ `attendanceCalculation.service.js` → `calculateWorkHours()`

### "Where is final status determined?"
→ `AttendanceRecord.js` → `finalizeWithShift()`

### "Where is the daily job?"
→ `attendanceFinalization.js` → `run()`

### "Where are endpoints defined?"
→ `attendance.controller.js` (employee or admin)

---

**Last Updated**: January 29, 2026
