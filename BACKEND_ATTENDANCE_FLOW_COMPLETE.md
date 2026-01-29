# Backend Attendance Flow - Complete Guide

## Overview
This document shows how the backend processes attendance records, calculates late arrivals, marks incomplete records, and determines final status.

---

## 1. 📊 AttendanceRecord Model (Database Schema)

**File**: `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

### Key Fields

```javascript
// Clock In/Out Times
clockIn: DATE              // When employee clocked in
clockOut: DATE             // When employee clocked out

// Late Arrival Tracking
lateMinutes: INTEGER       // How many minutes late
isLate: BOOLEAN            // Is employee late?

// Work Hours Calculation
totalWorkedMinutes: INTEGER    // Total minutes worked (excluding breaks)
workHours: DECIMAL(4,2)        // Total hours worked (e.g., 8.50)
totalBreakMinutes: INTEGER     // Total break time

// Status (Most Important)
status: ENUM(
  'present',              // ✅ Worked full day (≥ 8 hours)
  'absent',               // ❌ No clock-in on working day
  'leave',                // 📅 Approved leave
  'half_day',             // ⏱️ Worked 4-8 hours
  'holiday',              // 🎉 System holiday
  'incomplete',           // ⚠️ Clocked in but NOT clocked out (MISSING CLOCK-OUT)
  'pending_correction'    // 🔄 Awaiting correction approval
)

// Overtime
overtimeMinutes: INTEGER   // Minutes worked beyond shift
overtimeHours: DECIMAL     // Hours worked beyond shift

// Break Sessions
breakSessions: JSON        // Array of break sessions
[
  {
    breakIn: "2026-01-29T10:30:00Z",
    breakOut: "2026-01-29T10:45:00Z",
    duration: 15
  }
]
```

### Status Determination Logic

```
┌─────────────────────────────────────────────────────────┐
│  Attendance Status Decision Tree                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Is it a holiday?                                       │
│  ├─ YES → Status = 'holiday'                            │
│  └─ NO → Continue                                       │
│                                                         │
│  Is there an approved leave?                            │
│  ├─ YES → Status = 'leave'                              │
│  └─ NO → Continue                                       │
│                                                         │
│  Has employee clocked in?                               │
│  ├─ NO → Status = 'absent'                              │
│  └─ YES → Continue                                      │
│                                                         │
│  Has employee clocked out?                              │
│  ├─ NO → Status = 'incomplete' ⚠️ (MISSING CLOCK-OUT)   │
│  └─ YES → Continue                                      │
│                                                         │
│  Calculate work hours (excluding breaks)                │
│  ├─ >= 8 hours → Status = 'present' ✅                  │
│  ├─ 4-8 hours → Status = 'half_day' ⏱️                  │
│  └─ < 4 hours → Status = 'half_day' ⏱️                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. ⏰ AttendanceCalculationService (Business Logic)

**File**: `HRM-System/backend/src/services/core/attendanceCalculation.service.js`

### Key Methods

#### A. Calculate Late Status
```javascript
calculateLateStatus(clockInTime, shift, attendanceDate)
```

**What it does**:
- Compares actual clock-in time with shift start time
- Adds grace period (usually 5 minutes)
- Returns late minutes and status

**Example**:
```
Shift Start: 09:00
Grace Period: 5 minutes
Late Threshold: 09:05

Employee Clock-In: 09:15
Late Minutes: 10 minutes (09:15 - 09:05)
isLate: true
```

**Code**:
```javascript
static calculateLateStatus(clockInTime, shift, attendanceDate) {
  // Parse shift start time (e.g., "09:00")
  const [hours, minutes, seconds = 0] = shift.shiftStartTime.split(':').map(Number);
  
  // Create shift start time for the attendance date
  const shiftStart = new Date(attendanceDate);
  shiftStart.setHours(hours, minutes, seconds, 0);
  
  // Add grace period
  const gracePeriodMs = (shift.gracePeriodMinutes || 0) * 60 * 1000;
  const lateThreshold = new Date(shiftStart.getTime() + gracePeriodMs);
  
  // Calculate late minutes
  let lateMinutes = 0;
  let isLate = false;
  
  if (clockInTime > lateThreshold) {
    lateMinutes = Math.floor((clockInTime - lateThreshold) / (1000 * 60));
    isLate = true;
  }
  
  return { isLate, lateMinutes, shiftStartTime: shiftStart, lateThreshold };
}
```

#### B. Calculate Work Hours
```javascript
calculateWorkHours(clockIn, clockOut, breakSessions)
```

**What it does**:
- Calculates time between clock-in and clock-out
- Subtracts break time
- Returns net work minutes

**Example**:
```
Clock In: 09:15
Clock Out: 17:30
Total Time: 8 hours 15 minutes (495 minutes)

Breaks:
- Break 1: 10:30-10:45 (15 minutes)
- Break 2: 13:00-13:30 (30 minutes)
Total Breaks: 45 minutes

Work Minutes: 495 - 45 = 450 minutes = 7.5 hours
```

**Code**:
```javascript
static calculateWorkHours(clockIn, clockOut, breakSessions = []) {
  // Total time between clock in and out
  const totalTimeMs = clockOut.getTime() - clockIn.getTime();
  
  // Calculate total break duration
  let totalBreakMs = 0;
  breakSessions.forEach(session => {
    if (session.breakIn && session.breakOut) {
      const breakDuration = new Date(session.breakOut).getTime() - new Date(session.breakIn).getTime();
      totalBreakMs += breakDuration;
    }
  });
  
  // Calculate actual work time
  const workTimeMs = Math.max(0, totalTimeMs - totalBreakMs);
  const workMinutes = Math.floor(workTimeMs / (1000 * 60));
  const breakMinutes = Math.floor(totalBreakMs / (1000 * 60));
  
  return { workMinutes, breakMinutes, totalWorkTimeMs: workTimeMs };
}
```

#### C. Calculate Overtime
```javascript
calculateOvertime(workMinutes, shift)
```

**What it does**:
- Compares work minutes with shift full day hours
- Returns overtime minutes

**Example**:
```
Full Day Hours: 8 hours = 480 minutes
Work Minutes: 540 minutes (9 hours)
Overtime: 540 - 480 = 60 minutes = 1 hour
```

---

## 3. 🎯 Attendance Finalization Job

**File**: `HRM-System/backend/src/jobs/attendanceFinalization.js`

### What it does
- Runs daily (usually at end of day or next morning)
- Marks incomplete records (missing clock-out)
- Marks absent records (no clock-in)
- Finalizes attendance status

### Flow

```
┌─────────────────────────────────────────────────────────┐
│  Attendance Finalization Job (Daily)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Get all attendance records for yesterday            │
│                                                         │
│  2. For each record:                                    │
│     ├─ If clockIn exists but NO clockOut               │
│     │  └─ Mark as 'pending_correction'                 │
│     │     (Reason: "Missed clock-out")                 │
│     │                                                   │
│     ├─ If NO clockIn and NOT on leave/holiday          │
│     │  └─ Mark as 'absent'                             │
│     │     (Reason: "No attendance recorded")            │
│     │                                                   │
│     └─ If clockIn AND clockOut exist                   │
│        └─ Calculate final status:                      │
│           ├─ Calculate work hours                      │
│           ├─ Compare with shift thresholds             │
│           ├─ Determine: present / half_day             │
│           └─ Save final status                         │
│                                                         │
│  3. Log all changes                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 🔄 Complete Attendance Record Lifecycle

### Step 1: Employee Clocks In

**File**: `HRM-System/backend/src/controllers/employee/attendance.controller.js`

```javascript
// Employee clocks in at 09:15
POST /api/employee/attendance/clock-in
{
  location: { lat: 28.6139, lng: 77.2090 },
  workMode: "office"
}

// Backend creates/updates record:
{
  employeeId: 1,
  date: "2026-01-29",
  clockIn: "2026-01-29T09:15:00Z",
  clockOut: null,
  status: "incomplete",  // ⚠️ INCOMPLETE - Missing clock-out
  isLate: true,
  lateMinutes: 10,
  workMode: "office"
}
```

### Step 2: Calculate Late Status

```javascript
// Using AttendanceCalculationService
const lateStatus = AttendanceCalculationService.calculateLateStatus(
  clockInTime,      // 2026-01-29T09:15:00Z
  shift,            // { shiftStartTime: "09:00", gracePeriodMinutes: 5 }
  attendanceDate    // "2026-01-29"
);

// Result:
{
  isLate: true,
  lateMinutes: 10,
  shiftStartTime: 2026-01-29T09:00:00Z,
  lateThreshold: 2026-01-29T09:05:00Z
}

// Record updated:
{
  isLate: true,
  lateMinutes: 10
}
```

### Step 3: Employee Takes Breaks

```javascript
// Break 1: 10:30-10:45
POST /api/employee/attendance/start-break
// breakSessions: [{ breakIn: "2026-01-29T10:30:00Z", breakOut: null }]

POST /api/employee/attendance/end-break
// breakSessions: [{ breakIn: "2026-01-29T10:30:00Z", breakOut: "2026-01-29T10:45:00Z", duration: 15 }]

// Break 2: 13:00-13:30
// breakSessions: [
//   { breakIn: "2026-01-29T10:30:00Z", breakOut: "2026-01-29T10:45:00Z", duration: 15 },
//   { breakIn: "2026-01-29T13:00:00Z", breakOut: "2026-01-29T13:30:00Z", duration: 30 }
// ]

// Record updated:
{
  breakSessions: [...],
  totalBreakMinutes: 45
}
```

### Step 4: Employee Clocks Out

```javascript
// Employee clocks out at 17:30
POST /api/employee/attendance/clock-out

// Backend updates record:
{
  clockOut: "2026-01-29T17:30:00Z",
  status: "incomplete"  // ⚠️ Still incomplete until finalization
}
```

### Step 5: Calculate Work Hours

```javascript
// Using AttendanceCalculationService
const workHours = AttendanceCalculationService.calculateWorkHours(
  clockIn,        // 2026-01-29T09:15:00Z
  clockOut,       // 2026-01-29T17:30:00Z
  breakSessions   // [{ breakIn: ..., breakOut: ..., duration: 15 }, ...]
);

// Calculation:
// Total time: 17:30 - 09:15 = 8 hours 15 minutes = 495 minutes
// Break time: 15 + 30 = 45 minutes
// Work time: 495 - 45 = 450 minutes = 7.5 hours

// Result:
{
  workMinutes: 450,
  breakMinutes: 45,
  totalWorkTimeMs: 27000000
}

// Record updated:
{
  totalWorkedMinutes: 450,
  totalBreakMinutes: 45,
  workHours: 7.50
}
```

### Step 6: Finalization Job Runs (Next Day)

```javascript
// Job runs at 00:30 AM (next day)
// Processes all records from yesterday

// For our employee:
// - Has clockIn: ✅
// - Has clockOut: ✅
// - Calculate final status

const shift = {
  fullDayHours: 8,
  halfDayHours: 4
};

// Work hours: 7.5 hours
// >= 4 hours and < 8 hours → HALF DAY

// Record finalized:
{
  status: "half_day",
  halfDayType: "full_day",  // Actually worked 7.5 hours
  statusReason: "Worked 7.5 hours (≥ 4 for half day, < 8 for full day)"
}
```

---

## 5. 📋 Incomplete Record Scenarios

### Scenario 1: Employee Forgets to Clock Out

```
Timeline:
09:15 - Clock In
10:30-10:45 - Break 1
13:00-13:30 - Break 2
17:30 - Shift ends
18:00 - Employee leaves without clocking out
23:59 - End of day

Status: INCOMPLETE ⚠️

Record:
{
  clockIn: "2026-01-29T09:15:00Z",
  clockOut: null,  // ❌ MISSING
  status: "incomplete",
  statusReason: "Missed clock-out - requires correction"
}

Next Day (Finalization Job):
- Detects: clockIn exists but NO clockOut
- Marks as: 'pending_correction'
- Reason: "Missed clock-out - requires correction"
- Employee must submit correction request
```

### Scenario 2: Employee Clocks In But Leaves Early

```
Timeline:
09:15 - Clock In
10:30-10:45 - Break
12:00 - Clocks Out (early departure)

Status: HALF_DAY ✅

Record:
{
  clockIn: "2026-01-29T09:15:00Z",
  clockOut: "2026-01-29T12:00:00Z",
  totalWorkedMinutes: 255,  // 4 hours 15 minutes
  workHours: 4.25,
  status: "half_day",
  isEarlyDeparture: true,
  earlyExitMinutes: 300  // 5 hours early
}
```

### Scenario 3: Employee Doesn't Clock In

```
Timeline:
09:00 - Shift starts
17:00 - Shift ends
No clock-in recorded

Status: ABSENT ❌

Record:
{
  clockIn: null,  // ❌ NO CLOCK-IN
  clockOut: null,
  status: "absent",
  statusReason: "No attendance recorded"
}
```

---

## 6. 🔍 Key Calculations Summary

### Late Calculation
```
Formula: Late Minutes = Clock-In Time - (Shift Start + Grace Period)

Example:
Shift Start: 09:00
Grace Period: 5 minutes
Late Threshold: 09:05
Clock-In: 09:15
Late Minutes: 09:15 - 09:05 = 10 minutes
```

### Work Hours Calculation
```
Formula: Work Hours = (Clock-Out - Clock-In) - Total Break Time

Example:
Clock-In: 09:15
Clock-Out: 17:30
Total Time: 8 hours 15 minutes = 495 minutes

Breaks:
- Break 1: 15 minutes
- Break 2: 30 minutes
Total Breaks: 45 minutes

Work Hours: 495 - 45 = 450 minutes = 7.5 hours
```

### Status Determination
```
If clockIn exists AND clockOut exists:
  Calculate work hours
  If work hours >= 8:
    Status = "present"
  Else if work hours >= 4:
    Status = "half_day"
  Else:
    Status = "half_day"

Else if clockIn exists AND NO clockOut:
  Status = "incomplete" ⚠️ (MISSING CLOCK-OUT)

Else if NO clockIn:
  Status = "absent"
```

### Overtime Calculation
```
Formula: Overtime Minutes = Work Minutes - (Full Day Hours × 60)

Example:
Full Day Hours: 8
Work Minutes: 540 (9 hours)
Overtime: 540 - 480 = 60 minutes = 1 hour
```

---

## 7. 📁 Related Backend Files

### Controllers
- `HRM-System/backend/src/controllers/employee/attendance.controller.js` - Employee clock in/out
- `HRM-System/backend/src/controllers/admin/attendance.controller.js` - Admin attendance management

### Services
- `HRM-System/backend/src/services/core/attendanceCalculation.service.js` - Calculations
- `HRM-System/backend/src/services/admin/attendance.service.js` - Admin operations

### Jobs
- `HRM-System/backend/src/jobs/attendanceFinalization.js` - Daily finalization

### Models
- `HRM-System/backend/src/models/sequelize/AttendanceRecord.js` - Database schema
- `HRM-System/backend/src/models/sequelize/EmployeeShift.js` - Shift configuration

### Routes
- `HRM-System/backend/src/routes/employee/attendance.routes.js` - Employee endpoints

---

## 8. 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Employee Clock In                                              │
│  POST /api/employee/attendance/clock-in                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  AttendanceRecord Created                                       │
│  - clockIn: 09:15                                               │
│  - status: "incomplete"                                         │
│  - isLate: false                                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  AttendanceCalculationService.calculateLateStatus()             │
│  - Compare clockIn with shift start + grace period              │
│  - Update: isLate, lateMinutes                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Employee Takes Breaks                                          │
│  - Start Break: breakSessions[0].breakIn = 10:30                │
│  - End Break: breakSessions[0].breakOut = 10:45                 │
│  - Update: totalBreakMinutes = 15                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Employee Clock Out                                             │
│  POST /api/employee/attendance/clock-out                        │
│  - clockOut: 17:30                                              │
│  - status: still "incomplete" (until finalization)              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  AttendanceCalculationService.calculateWorkHours()              │
│  - Calculate: (17:30 - 09:15) - breaks                          │
│  - Update: totalWorkedMinutes, workHours                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Attendance Finalization Job (Next Day)                         │
│  - Check: clockIn exists AND clockOut exists                    │
│  - Calculate final status based on work hours                   │
│  - Update: status = "present" or "half_day"                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Final Record                                                   │
│  - status: "half_day" (7.5 hours worked)                        │
│  - isLate: true (10 minutes late)                               │
│  - workHours: 7.50                                              │
│  - totalBreakMinutes: 45                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. ⚠️ Incomplete Record Handling

### What is "Incomplete"?
- Employee has **clocked in** ✅
- Employee has **NOT clocked out** ❌
- Status remains "incomplete" until:
  - Employee clocks out, OR
  - Finalization job marks as "pending_correction"

### Where It's Marked
1. **Initial Creation**: When employee clocks in
   - `status: "incomplete"`

2. **Finalization Job**: If still no clock-out next day
   - `status: "pending_correction"`
   - `statusReason: "Missed clock-out - requires correction"`

### How to Fix
1. **Employee clocks out** (if within grace period)
   - System calculates work hours
   - Finalizes as "present" or "half_day"

2. **Submit correction request**
   - Employee submits reason for missing clock-out
   - HR approves/rejects
   - Status updated to "present" or "half_day"

3. **Admin manual correction**
   - HR manually sets clock-out time
   - System recalculates
   - Status finalized

---

## 10. 📊 Status Transition Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  Attendance Status Transitions                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  START                                                       │
│    │                                                         │
│    ├─ Holiday? ──────────────────────► "holiday"            │
│    │                                                         │
│    ├─ Leave? ────────────────────────► "leave"              │
│    │                                                         │
│    ├─ No Clock-In? ──────────────────► "absent"             │
│    │                                                         │
│    ├─ Clock-In but NO Clock-Out? ───► "incomplete" ⚠️       │
│    │                                   │                    │
│    │                                   ├─ Clock-Out ──────┐ │
│    │                                   │                  │ │
│    │                                   └─ Finalization ──┐│ │
│    │                                                     ││ │
│    ├─ Clock-In AND Clock-Out ──────────────────────────┐││ │
│    │                                                   │││ │
│    └─ Calculate Work Hours                            │││ │
│        │                                               │││ │
│        ├─ >= 8 hours ──────────────────────────────────┼┼┼─► "present"
│        │                                               │││
│        ├─ 4-8 hours ───────────────────────────────────┼┼┼─► "half_day"
│        │                                               │││
│        └─ < 4 hours ───────────────────────────────────┼┼┼─► "half_day"
│                                                        │││
│        Finalization Job (Next Day)                     │││
│        ├─ If still incomplete ────────────────────────┘││
│        │  └─ Mark as "pending_correction"              ││
│        │                                               ││
│        └─ If has clock-out ────────────────────────────┘│
│           └─ Finalize status                            │
│                                                         │
│        Employee Correction Request                      │
│        ├─ Approved ──────────────────────────────────────┘
│        │  └─ Status updated to "present" or "half_day"
│        │
│        └─ Rejected
│           └─ Status remains "pending_correction"
│
└──────────────────────────────────────────────────────────────┘
```

---

## Summary

### Key Points
1. **Incomplete Status** = Clocked in but NOT clocked out
2. **Late Calculation** = Clock-in time vs (Shift start + Grace period)
3. **Work Hours** = (Clock-out - Clock-in) - Break time
4. **Final Status** = Based on work hours vs shift thresholds
5. **Finalization** = Runs daily to mark incomplete as pending_correction

### Files to Check
- Model: `AttendanceRecord.js`
- Service: `attendanceCalculation.service.js`
- Job: `attendanceFinalization.js`
- Controller: `attendance.controller.js`

---

**Last Updated**: January 29, 2026
