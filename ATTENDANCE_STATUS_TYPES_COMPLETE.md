# 📋 Complete Attendance Status Types System

## Overview

This document defines all attendance status types, their rules, when they're applied, and how they're managed in the system.

---

## Status Types & Definitions

### 1. **PRESENT** ✅
**Definition:** Employee worked full day (≥8 hours)

**When Applied:**
- End-of-day cron job
- After both clock-in and clock-out recorded
- Worked hours ≥ full day threshold (8 hours)

**Rules:**
- Cannot be marked manually from UI
- Auto-calculated by cron job
- Requires both clock-in and clock-out
- Locked after cron finalization

**Data:**
```javascript
{
  status: 'present',
  statusReason: 'Worked 8.5 hours',
  clockIn: '2026-01-20T09:00:00Z',
  clockOut: '2026-01-20T17:30:00Z',
  workHours: 8.5,
  halfDayType: 'full_day'
}
```

---

### 2. **HALF_DAY** 🌗
**Definition:** Employee worked partial day (4-8 hours)

**When Applied:**
- End-of-day cron job
- After both clock-in and clock-out recorded
- Worked hours between 4 and 8 hours

**Rules:**
- Cannot be marked manually from UI
- Auto-calculated by cron job
- Requires both clock-in and clock-out
- Determines first_half or second_half based on clock-in time

**Data:**
```javascript
{
  status: 'half_day',
  statusReason: 'Worked 5.5 hours (half day)',
  clockIn: '2026-01-20T13:00:00Z',
  clockOut: '2026-01-20T18:30:00Z',
  workHours: 5.5,
  halfDayType: 'second_half'  // or 'first_half'
}
```

---

### 3. **ABSENT** ❌
**Definition:** Employee never clocked in (no attendance record)

**When Applied:**
- End-of-day cron job ONLY
- After shift end + buffer time
- No clock-in recorded for the day
- Not on approved leave or holiday

**Rules:**
- ✅ ONLY applied by cron job
- ❌ NEVER marked manually from UI
- ❌ NEVER marked during working hours
- ❌ NEVER marked at shift start
- ❌ NEVER marked if clock-in exists
- Idempotent (safe to run multiple times)

**Data:**
```javascript
{
  status: 'absent',
  statusReason: 'No clock-in recorded',
  clockIn: null,
  clockOut: null,
  workHours: 0,
  totalWorkedMinutes: 0
}
```

**Timeline:**
```
00:00 - 09:00  → No record / incomplete (too early)
09:00 - 18:00  → No clock-in → incomplete (still working hours)
18:30 - 19:00  → No clock-in → incomplete (shift ended, waiting for cron)
23:00 (cron)   → No clock-in → ABSENT ✅ (finalized by cron)
```

---

### 4. **PENDING_CORRECTION** ⏳
**Definition:** Employee clocked in but never clocked out (incomplete record)

**When Applied:**
- End-of-day cron job
- After shift end + buffer time
- Clock-in exists but no clock-out
- Not on approved leave or holiday

**Rules:**
- Applied by cron job when clock-out is missing
- Requires HR review and correction
- Employee can submit correction request
- Cannot clock in/out while pending

**Data:**
```javascript
{
  status: 'pending_correction',
  statusReason: 'Missed clock-out - requires correction',
  clockIn: '2026-01-20T09:00:00Z',
  clockOut: null,
  correctionRequested: true,
  correctionStatus: 'pending'
}
```

**Correction Request Created:**
```javascript
{
  employeeId: 1,
  attendanceRecordId: 123,
  date: '2026-01-20',
  issueType: 'missed_punch',
  reason: 'Auto-detected missed clock-out',
  status: 'pending'
}
```

---

### 5. **LEAVE** 🏖️
**Definition:** Employee is on approved leave

**When Applied:**
- Manually by HR when approving leave request
- Before the leave date
- Not by cron job

**Rules:**
- Set manually by HR
- Protected status (never auto-changed)
- Overrides all other statuses
- No clock-in/out allowed
- Cannot be changed by cron job

**Data:**
```javascript
{
  status: 'leave',
  statusReason: 'Approved leave - Casual Leave',
  clockIn: null,
  clockOut: null,
  workHours: 0,
  leaveRequestId: 456
}
```

---

### 6. **HOLIDAY** 🎉
**Definition:** Company holiday or weekend

**When Applied:**
- Automatically by system
- Based on holiday calendar and working rules
- Before the holiday date

**Rules:**
- Set automatically by system
- Protected status (never auto-changed)
- Overrides all other statuses
- No clock-in/out allowed
- Cannot be changed by cron job

**Data:**
```javascript
{
  status: 'holiday',
  statusReason: 'Company Holiday - New Year',
  clockIn: null,
  clockOut: null,
  workHours: 0,
  holidayId: 789
}
```

---

### 7. **INCOMPLETE** ⏸️
**Definition:** Attendance record exists but not yet finalized

**When Applied:**
- During working hours
- After clock-in but before clock-out
- Before cron job runs

**Rules:**
- Temporary status during the day
- Changed by cron job at end of day
- Employee can still clock in/out
- Not final status

**Data:**
```javascript
{
  status: 'incomplete',
  statusReason: 'Clock-out pending',
  clockIn: '2026-01-20T09:00:00Z',
  clockOut: null,
  workHours: 0
}
```

---

## Status Transition Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS TRANSITIONS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  START (No Record)                                              │
│    ↓                                                             │
│  INCOMPLETE (after clock-in)                                    │
│    ├─ Clock-out → PRESENT / HALF_DAY / ABSENT                  │
│    └─ No clock-out → PENDING_CORRECTION (cron)                 │
│                                                                 │
│  LEAVE (HR approved)                                            │
│    └─ Protected (never changes)                                │
│                                                                 │
│  HOLIDAY (System detected)                                      │
│    └─ Protected (never changes)                                │
│                                                                 │
│  ABSENT (No clock-in, cron)                                     │
│    └─ Can be corrected by HR                                   │
│                                                                 │
│  PENDING_CORRECTION (Missed clock-out, cron)                   │
│    └─ Requires HR correction                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cron Job Logic (End-of-Day Finalization)

### Execution Time
- Every 15 minutes (shift-aware)
- Finalizes only after shift ends

### Decision Tree

```javascript
if (isHoliday(date)) {
  // Skip - already marked as holiday
  return;
}

if (!isWorkingDay(date)) {
  // Skip - weekend
  return;
}

for (each employee) {
  // CASE 1: No attendance record at all
  if (!record) {
    mark ABSENT
    send notification
    continue
  }

  // CASE 2: Already finalized
  if (record.status !== 'incomplete') {
    skip (idempotent)
    continue
  }

  // CASE 3: Clock-in but no clock-out
  if (record.clockIn && !record.clockOut) {
    mark PENDING_CORRECTION
    create correction request
    send notification
    continue
  }

  // CASE 4: Invalid record (clock-out without clock-in)
  if (!record.clockIn && record.clockOut) {
    mark ABSENT
    clear invalid clock-out
    continue
  }

  // CASE 5: Both clock-in and clock-out
  if (record.clockIn && record.clockOut) {
    calculate workHours
    if (workHours >= 8) {
      mark PRESENT
    } else if (workHours >= 4) {
      mark HALF_DAY
    } else {
      mark ABSENT (insufficient hours)
    }
    continue
  }
}
```

---

## Manual Corrections (HR Only)

### When HR Can Correct
- After cron job marks ABSENT
- After cron job marks PENDING_CORRECTION
- Employee submits correction request

### Correction Types

#### 1. **Missed Clock-In**
```javascript
{
  issueType: 'missed_punch',
  reason: 'System was down',
  correctionType: 'add_clock_in',
  clockIn: '2026-01-20T09:15:00Z',
  newStatus: 'present'
}
```

#### 2. **Missed Clock-Out**
```javascript
{
  issueType: 'missed_punch',
  reason: 'Forgot to clock out',
  correctionType: 'add_clock_out',
  clockOut: '2026-01-20T18:00:00Z',
  newStatus: 'present'
}
```

#### 3. **Wrong Status**
```javascript
{
  issueType: 'wrong_status',
  reason: 'Should be half day',
  correctionType: 'change_status',
  newStatus: 'half_day',
  halfDayType: 'first_half'
}
```

#### 4. **Approve Leave**
```javascript
{
  issueType: 'leave_approval',
  reason: 'Casual leave approved',
  correctionType: 'mark_leave',
  newStatus: 'leave',
  leaveRequestId: 456
}
```

---

## UI Display Rules

### Employee View
- ✅ See today's status (incomplete/present/half_day/absent/leave/holiday)
- ✅ See monthly summary
- ✅ Submit correction requests
- ❌ Cannot manually change status
- ❌ Cannot mark absent

### HR View
- ✅ See all employee statuses
- ✅ Manually correct records
- ✅ Approve/reject corrections
- ✅ Mark leave/holiday
- ✅ View audit trail

### Admin View
- ✅ See all statuses
- ✅ Configure rules
- ✅ View cron job logs
- ✅ Manual finalization trigger

---

## Notifications

### Employee Notifications

#### 1. **Late Arrival**
```
Title: You were late today
Message: You clocked in 15 minutes late. Please ensure to arrive on time.
Trigger: During shift, when clock-in is after shift start + threshold
```

#### 2. **Marked Absent**
```
Title: Attendance Marked as Absent
Message: Your attendance for 2026-01-20 was marked as absent. 
         Please submit a correction request if this is incorrect.
Trigger: End-of-day cron, when no clock-in recorded
```

#### 3. **Pending Correction**
```
Title: Attendance Correction Required
Message: Your attendance for 2026-01-20 requires correction. 
         You missed clocking out. Please submit a correction request.
Trigger: End-of-day cron, when clock-out is missing
```

#### 4. **On Time**
```
Title: Great job! You're on time today
Message: Keep up the excellent attendance record.
Trigger: End-of-day cron, when marked present and on time
```

### HR Notifications

#### 1. **Pending Corrections**
```
Title: Attendance Corrections Pending
Message: 5 employees have pending attendance corrections requiring review.
Trigger: When corrections are created
```

#### 2. **High Absence Rate**
```
Title: High Absence Alert
Message: Department X has 15% absence rate this month.
Trigger: Daily/weekly summary
```

---

## Audit Trail

Every status change is logged:

```javascript
{
  action: 'ATTENDANCE_STATUS_CHANGED',
  employeeId: 1,
  date: '2026-01-20',
  oldStatus: 'incomplete',
  newStatus: 'absent',
  reason: 'Auto-marked by cron job',
  changedBy: 'system',
  changedAt: '2026-01-20T23:00:00Z',
  details: {
    clockIn: null,
    clockOut: null,
    workHours: 0
  }
}
```

---

## Database Schema

```sql
CREATE TABLE attendance_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employeeId INT NOT NULL,
  date DATE NOT NULL,
  
  -- Clock times
  clockIn DATETIME,
  clockOut DATETIME,
  
  -- Status
  status ENUM('present', 'absent', 'leave', 'half_day', 'holiday', 'incomplete', 'pending_correction'),
  statusReason VARCHAR(255),
  
  -- Work hours
  workHours DECIMAL(4,2),
  totalWorkedMinutes INT,
  totalBreakMinutes INT,
  
  -- Half day
  halfDayType ENUM('first_half', 'second_half', 'full_day'),
  
  -- Late/Early
  isLate BOOLEAN,
  lateMinutes INT,
  isEarlyDeparture BOOLEAN,
  earlyExitMinutes INT,
  
  -- Overtime
  overtimeMinutes INT,
  overtimeHours DECIMAL(4,2),
  
  -- Correction
  correctionRequested BOOLEAN,
  correctionStatus ENUM('pending', 'approved', 'rejected'),
  correctionReason TEXT,
  correctedBy INT,
  correctedAt DATETIME,
  
  -- Audit
  createdBy INT,
  updatedBy INT,
  createdAt DATETIME,
  updatedAt DATETIME,
  
  UNIQUE KEY unique_employee_date (employeeId, date),
  INDEX idx_date (date),
  INDEX idx_status (status)
);
```

---

## API Endpoints

### Employee Endpoints

#### Get Attendance Records
```
GET /api/employee/attendance/records?month=1&year=2026
Response: { data: [...], summary: {...} }
```

#### Get Attendance Summary
```
GET /api/employee/attendance/summary?month=1&year=2026
Response: { presentDays, absentDays, halfDays, ... }
```

#### Submit Correction Request
```
POST /api/employee/attendance/correction-request
Body: {
  attendanceRecordId: 123,
  issueType: 'missed_punch',
  reason: 'System was down'
}
```

### HR Endpoints

#### Get All Attendance
```
GET /api/admin/attendance?month=1&year=2026&department=1
Response: { data: [...], stats: {...} }
```

#### Correct Attendance
```
PUT /api/admin/attendance/:id/correct
Body: {
  status: 'present',
  clockIn: '2026-01-20T09:00:00Z',
  clockOut: '2026-01-20T18:00:00Z',
  reason: 'Manual correction'
}
```

#### Approve Correction Request
```
PUT /api/admin/attendance/correction-request/:id/approve
Body: {
  status: 'approved',
  newAttendanceStatus: 'present'
}
```

---

## Testing Scenarios

### Scenario 1: Normal Present Day
```
09:00 - Clock-in
17:30 - Clock-out
23:00 - Cron runs
Result: PRESENT (8.5 hours)
```

### Scenario 2: Half Day
```
13:00 - Clock-in
18:00 - Clock-out
23:00 - Cron runs
Result: HALF_DAY (5 hours, second_half)
```

### Scenario 3: Absent (No Clock-In)
```
No clock-in
23:00 - Cron runs
Result: ABSENT
Notification: Sent to employee
```

### Scenario 4: Missed Clock-Out
```
09:00 - Clock-in
No clock-out
23:00 - Cron runs
Result: PENDING_CORRECTION
Correction Request: Created
Notification: Sent to employee
```

### Scenario 5: Leave Day
```
HR approves leave
Status: LEAVE (protected)
Cron: Skips (protected status)
Result: LEAVE
```

### Scenario 6: Holiday
```
System detects holiday
Status: HOLIDAY (protected)
Cron: Skips (protected status)
Result: HOLIDAY
```

---

## Configuration

### System Settings
```javascript
{
  fullDayHours: 8,
  halfDayHours: 4,
  lateThresholdMinutes: 5,
  earlyDepartureThresholdMinutes: 5,
  overtimeThresholdMinutes: 0,
  shiftStartTime: '09:00',
  shiftEndTime: '18:00',
  bufferTimeAfterShiftMinutes: 30,
  cronJobInterval: '*/15 * * * *'  // Every 15 minutes
}
```

---

## Summary

| Status | Applied By | When | Changeable | Protected |
|--------|-----------|------|-----------|-----------|
| PRESENT | Cron | End-of-day | HR only | No |
| HALF_DAY | Cron | End-of-day | HR only | No |
| ABSENT | Cron | End-of-day | HR only | No |
| PENDING_CORRECTION | Cron | End-of-day | HR only | No |
| LEAVE | HR | Before date | HR only | Yes |
| HOLIDAY | System | Before date | Admin only | Yes |
| INCOMPLETE | System | During day | Auto-changes | No |

---

**Status:** ✅ COMPLETE & PRODUCTION-READY
