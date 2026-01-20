# 🛠️ Attendance Status Implementation Guide

## Quick Reference

### Status Types at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE STATUSES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ PRESENT          → Worked ≥8 hours (cron)                  │
│  🌗 HALF_DAY         → Worked 4-8 hours (cron)                 │
│  ❌ ABSENT           → No clock-in (cron only)                 │
│  ⏳ PENDING_CORRECTION → Missed clock-out (cron)               │
│  🏖️  LEAVE           → Approved leave (HR)                     │
│  🎉 HOLIDAY          → Company holiday (system)                │
│  ⏸️  INCOMPLETE       → During day (temporary)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Backend Implementation

#### 1. Database Schema ✅
- [x] AttendanceRecord model with all status fields
- [x] Indexes on employeeId, date, status
- [x] Unique constraint on (employeeId, date)
- [x] Audit fields (createdBy, updatedBy, createdAt, updatedAt)

**File:** `HRM-System/backend/src/models/sequelize/AttendanceRecord.js`

#### 2. Cron Job ✅
- [x] Runs every 15 minutes
- [x] Checks for holidays and weekends
- [x] Processes each employee
- [x] Handles all 5 cases (no record, incomplete, pending, invalid, complete)
- [x] Error handling and logging
- [x] Idempotent operations

**File:** `HRM-System/backend/src/jobs/attendanceFinalization.js`

#### 3. Services ✅
- [x] Attendance service for calculations
- [x] Status evaluation logic
- [x] Correction request handling
- [x] Notification service integration

**File:** `HRM-System/backend/src/services/admin/attendance.service.js`

#### 4. Controllers ✅
- [x] Employee attendance endpoints
- [x] Admin attendance endpoints
- [x] Correction request endpoints
- [x] Manual finalization trigger

**File:** `HRM-System/backend/src/controllers/admin/attendance.controller.js`

#### 5. Validation ✅
- [x] Status transition validation
- [x] Protected status checks
- [x] Correction request validation
- [x] Leave/holiday checks

**File:** `HRM-System/backend/src/validators/`

#### 6. Audit Logging ✅
- [x] Log all status changes
- [x] Track who made changes
- [x] Store old and new values
- [x] Timestamp all changes

**File:** `HRM-System/backend/src/utils/auditLogger.js`

---

### Frontend Implementation

#### 1. Employee Pages ✅
- [x] Attendance dashboard
- [x] Today's status display
- [x] Monthly summary
- [x] Correction request form
- [x] Status alerts

**Files:**
- `HRM-System/frontend/src/modules/attendance/employee/AttendancePage.jsx`
- `HRM-System/frontend/src/modules/attendance/employee/AttendanceStatsWidget.jsx`
- `HRM-System/frontend/src/modules/attendance/employee/AttendanceSummary.jsx`

#### 2. Admin Pages ✅
- [x] Attendance management
- [x] Bulk corrections
- [x] Correction request review
- [x] Reports and analytics
- [x] Manual finalization

**Files:**
- `HRM-System/frontend/src/modules/attendance/admin/ManageAttendance.jsx`
- `HRM-System/frontend/src/modules/attendance/admin/AttendanceCorrections.jsx`

#### 3. Components ✅
- [x] Status badge component
- [x] Status alert component
- [x] Correction form component
- [x] Status history component

**Files:**
- `HRM-System/frontend/src/shared/components/AttendanceStatusBadge.jsx`
- `HRM-System/frontend/src/modules/attendance/components/`

#### 4. Services ✅
- [x] Attendance API service
- [x] Correction request service
- [x] Report export service

**Files:**
- `HRM-System/frontend/src/services/attendanceService.js`
- `HRM-System/frontend/src/services/useEmployeeSelfService.js`

---

## Status-Specific Implementation

### 1. PRESENT Status

**Backend Logic:**
```javascript
// In attendanceFinalization.js
if (record.clockIn && record.clockOut) {
  record.calculateWorkingHours();
  const workedHours = record.workHours || 0;
  
  if (workedHours >= 8) {
    record.status = 'present';
    record.halfDayType = 'full_day';
    record.statusReason = `Worked ${workedHours.toFixed(2)} hours`;
  }
}
```

**Frontend Display:**
```jsx
<Badge className="bg-green-100 text-green-800">
  Present - 8.5 hours
</Badge>
```

**Notification:**
```
Title: Great job! You're on time today
Message: Keep up the excellent attendance record.
```

---

### 2. HALF_DAY Status

**Backend Logic:**
```javascript
// In attendanceFinalization.js
if (record.clockIn && record.clockOut) {
  record.calculateWorkingHours();
  const workedHours = record.workHours || 0;
  
  if (workedHours >= 4 && workedHours < 8) {
    record.status = 'half_day';
    record.halfDayType = record.determineHalfDayType(shift);
    record.statusReason = `Worked ${workedHours.toFixed(2)} hours (half day)`;
  }
}
```

**Half-Day Type Determination:**
```javascript
determineHalfDayType(shift) {
  const clockInTime = new Date(this.clockIn);
  const shiftMidpoint = calculateShiftMidpoint(shift);
  
  return clockInTime <= shiftMidpoint ? 'first_half' : 'second_half';
}
```

**Frontend Display:**
```jsx
<Badge className="bg-yellow-100 text-yellow-800">
  Half Day - 5.5 hours (Second Half)
</Badge>
```

---

### 3. ABSENT Status

**Backend Logic:**
```javascript
// In attendanceFinalization.js
// CASE 1: No record at all
if (!record) {
  await AttendanceRecord.create({
    employeeId: employee.id,
    date: dateString,
    status: 'absent',
    statusReason: 'No clock-in recorded',
    clockIn: null,
    clockOut: null,
    workHours: 0
  });
  
  // Send notification
  await sendAbsentNotification(employee, dateString, 'No clock-in recorded');
}

// CASE 2: Invalid record (clock-out without clock-in)
if (!record.clockIn && record.clockOut) {
  record.status = 'absent';
  record.statusReason = 'Invalid record: clock-out without clock-in';
  record.clockOut = null;
  await record.save();
}
```

**Frontend Display:**
```jsx
<Card className="border-l-4 border-l-red-500 bg-red-50">
  <CardContent className="py-3">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <div>
        <p className="font-medium text-red-800">
          Marked as Absent
        </p>
        <p className="text-sm text-red-600">
          No clock-in recorded. Submit a correction request if this is incorrect.
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Notification:**
```
Title: Attendance Marked as Absent
Message: Your attendance for 2026-01-20 was marked as absent. 
         Please submit a correction request if this is incorrect.
```

---

### 4. PENDING_CORRECTION Status

**Backend Logic:**
```javascript
// In attendanceFinalization.js
if (record.clockIn && !record.clockOut) {
  record.status = 'pending_correction';
  record.correctionRequested = true;
  record.statusReason = 'Missed clock-out - requires correction';
  await record.save();
  
  // Create correction request
  await AttendanceCorrectionRequest.create({
    employeeId: employee.id,
    attendanceRecordId: record.id,
    date: dateString,
    issueType: 'missed_punch',
    reason: 'Auto-detected missed clock-out',
    status: 'pending'
  });
  
  // Send notification
  await sendCorrectionNotification(employee, dateString, 'Clock-out missing');
}
```

**Frontend Display:**
```jsx
<Card className="border-l-4 border-l-orange-500 bg-orange-50">
  <CardContent className="py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-orange-600" />
        <div>
          <p className="font-medium text-orange-800">
            Incomplete attendance record detected
          </p>
          <p className="text-sm text-orange-600">
            You have an incomplete attendance record. Please submit a correction request.
          </p>
        </div>
      </div>
      <Badge variant="outline" className="bg-orange-100 text-orange-800">
        Pending Correction
      </Badge>
    </div>
  </CardContent>
</Card>
```

**Correction Request Form:**
```jsx
<form onSubmit={handleSubmitCorrection}>
  <input type="hidden" value={attendanceRecordId} />
  
  <select name="issueType" required>
    <option value="missed_punch">Missed Clock-Out</option>
    <option value="wrong_status">Wrong Status</option>
  </select>
  
  <textarea 
    name="reason" 
    placeholder="Explain why correction is needed"
    required
  />
  
  <input 
    type="datetime-local" 
    name="clockOut" 
    placeholder="Clock-out time"
  />
  
  <button type="submit">Submit Correction Request</button>
</form>
```

**Notification:**
```
Title: Attendance Correction Required
Message: Your attendance for 2026-01-20 requires correction. 
         You missed clocking out. Please submit a correction request.
```

---

### 5. LEAVE Status

**Backend Logic:**
```javascript
// In leaveRequest approval
if (leaveRequest.status === 'approved') {
  for (let date = startDate; date <= endDate; date++) {
    await AttendanceRecord.create({
      employeeId: leaveRequest.employeeId,
      date: date,
      status: 'leave',
      statusReason: `Approved leave - ${leaveRequest.leaveType}`,
      clockIn: null,
      clockOut: null,
      workHours: 0,
      leaveRequestId: leaveRequest.id
    });
  }
}
```

**Frontend Display:**
```jsx
<Badge className="bg-blue-100 text-blue-800">
  Leave - Casual Leave
</Badge>
```

**Protected Status:**
```javascript
// Cron job skips leave records
if (['leave', 'holiday'].includes(record.status)) {
  logger.debug(`Skipping ${record.status} record`);
  return;
}
```

---

### 6. HOLIDAY Status

**Backend Logic:**
```javascript
// In holiday creation
if (holiday.isCompanyWide) {
  const employees = await Employee.findAll({ where: { isActive: true } });
  
  for (const employee of employees) {
    await AttendanceRecord.create({
      employeeId: employee.id,
      date: holiday.date,
      status: 'holiday',
      statusReason: `Company Holiday - ${holiday.name}`,
      clockIn: null,
      clockOut: null,
      workHours: 0,
      holidayId: holiday.id
    });
  }
}
```

**Frontend Display:**
```jsx
<Badge className="bg-purple-100 text-purple-800">
  Holiday - New Year
</Badge>
```

**Cron Job Check:**
```javascript
const isHoliday = await Holiday.isHoliday(dateString);
if (isHoliday) {
  logger.info(`${dateString} is a holiday. Skipping finalization.`);
  return { skipped: true, reason: 'holiday' };
}
```

---

### 7. INCOMPLETE Status

**Backend Logic:**
```javascript
// During the day, after clock-in but before clock-out
if (record.clockIn && !record.clockOut) {
  record.status = 'incomplete';
  record.statusReason = 'Clock-out pending';
  await record.save();
}
```

**Frontend Display:**
```jsx
<Badge className="bg-gray-100 text-gray-800">
  In Progress - Clocked In
</Badge>
```

**Auto-Change by Cron:**
```javascript
// Cron job changes incomplete to final status
if (record.status === 'incomplete') {
  // Apply finalization logic
  // Changes to present/half_day/absent/pending_correction
}
```

---

## Correction Request Workflow

### Employee Submits Correction

```javascript
// Frontend
const submitCorrection = async (data) => {
  const response = await api.post('/api/employee/attendance/correction-request', {
    attendanceRecordId: data.recordId,
    issueType: data.issueType,
    reason: data.reason,
    clockOut: data.clockOut  // Optional
  });
  
  toast.success('Correction request submitted');
};
```

### HR Reviews Correction

```javascript
// Backend
router.get('/api/admin/attendance/correction-requests', async (req, res) => {
  const requests = await AttendanceCorrectionRequest.findAll({
    where: { status: 'pending' },
    include: [
      { model: Employee, as: 'employee' },
      { model: AttendanceRecord, as: 'attendanceRecord' }
    ]
  });
  
  res.json(requests);
});
```

### HR Approves Correction

```javascript
// Backend
router.put('/api/admin/attendance/correction-request/:id/approve', async (req, res) => {
  const request = await AttendanceCorrectionRequest.findByPk(req.params.id);
  
  // Update correction request
  request.status = 'approved';
  request.processedBy = req.user.id;
  request.processedAt = new Date();
  await request.save();
  
  // Update attendance record
  const record = await AttendanceRecord.findByPk(request.attendanceRecordId);
  
  if (req.body.clockOut) {
    record.clockOut = req.body.clockOut;
    record.calculateWorkingHours();
  }
  
  record.status = req.body.newStatus;
  record.statusReason = `Corrected by HR: ${req.body.reason}`;
  record.correctionStatus = 'approved';
  record.correctedBy = req.user.id;
  record.correctedAt = new Date();
  await record.save();
  
  // Log audit
  await AuditLog.create({
    action: 'ATTENDANCE_CORRECTED',
    employeeId: record.employeeId,
    details: { oldStatus: 'pending_correction', newStatus: record.status }
  });
  
  // Send notification
  await notificationService.sendToEmployee(record.employeeId, {
    title: 'Attendance Correction Approved',
    message: `Your attendance correction for ${record.date} has been approved.`
  });
  
  res.json({ success: true, record });
});
```

---

## Testing Scenarios

### Test 1: Normal Present Day
```javascript
// Setup
const employee = await Employee.create({ ... });
const record = await AttendanceRecord.create({
  employeeId: employee.id,
  date: '2026-01-20',
  clockIn: '2026-01-20T09:00:00Z',
  clockOut: '2026-01-20T17:30:00Z'
});

// Run cron
await finalizeDailyAttendance();

// Verify
const updated = await AttendanceRecord.findByPk(record.id);
assert.equal(updated.status, 'present');
assert.equal(updated.workHours, 8.5);
```

### Test 2: Half Day
```javascript
// Setup
const record = await AttendanceRecord.create({
  employeeId: employee.id,
  date: '2026-01-20',
  clockIn: '2026-01-20T13:00:00Z',
  clockOut: '2026-01-20T18:30:00Z'
});

// Run cron
await finalizeDailyAttendance();

// Verify
const updated = await AttendanceRecord.findByPk(record.id);
assert.equal(updated.status, 'half_day');
assert.equal(updated.halfDayType, 'second_half');
```

### Test 3: Absent (No Clock-In)
```javascript
// Setup
const employee = await Employee.create({ ... });
// No attendance record created

// Run cron
await finalizeDailyAttendance();

// Verify
const record = await AttendanceRecord.findOne({
  where: { employeeId: employee.id, date: '2026-01-20' }
});
assert.equal(record.status, 'absent');
assert.isNull(record.clockIn);
```

### Test 4: Pending Correction (Missed Clock-Out)
```javascript
// Setup
const record = await AttendanceRecord.create({
  employeeId: employee.id,
  date: '2026-01-20',
  clockIn: '2026-01-20T09:00:00Z',
  clockOut: null
});

// Run cron
await finalizeDailyAttendance();

// Verify
const updated = await AttendanceRecord.findByPk(record.id);
assert.equal(updated.status, 'pending_correction');

const correction = await AttendanceCorrectionRequest.findOne({
  where: { attendanceRecordId: record.id }
});
assert.equal(correction.status, 'pending');
```

---

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Cron job configured and running
- [ ] Notification service working
- [ ] Audit logging enabled
- [ ] Frontend components deployed
- [ ] API endpoints tested
- [ ] Correction workflow tested
- [ ] Notifications tested
- [ ] Reports working
- [ ] Monitoring alerts set up

---

**Status:** ✅ COMPLETE & READY FOR IMPLEMENTATION
