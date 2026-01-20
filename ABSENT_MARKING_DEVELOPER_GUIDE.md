# 👨‍💻 ABSENT MARKING - DEVELOPER'S GUIDE

This guide is for developers who need to understand, maintain, or extend the ABSENT marking system.

---

## 🎯 QUICK START

### 1. Understand the Core Principle
```
ABSENT is a DECISION, not a LIVE STATUS

Realtime state = incomplete
Final state = absent / present / half_day / leave
```

### 2. Know the Timeline
```
Before Shift (00:00-09:00)   → No record / incomplete
During Shift (09:00-18:00)   → No clock-in → incomplete
After Shift (18:30-19:00)    → Still incomplete
End of Day (≈23:00)          → Cron runs → ABSENT ✅
```

### 3. Remember the Rule
> Employee is marked ABSENT only after end-of-day cron job if they never clocked in.

---

## 📁 FILE STRUCTURE

```
HRM-System/backend/
├── src/
│   ├── jobs/
│   │   └── attendanceFinalization.js      ← Cron job (MAIN)
│   ├── models/sequelize/
│   │   └── AttendanceRecord.js            ← Data model
│   ├── services/admin/
│   │   └── attendance.service.js          ← Business logic
│   └── server.js                          ← Cron initialization
└── tests/
    └── final-absent-marking-test.js       ← Test suite
```

---

## 🔍 CODE WALKTHROUGH

### File 1: `src/jobs/attendanceFinalization.js`

**Purpose**: Runs every 15 minutes to finalize attendance

**Key Functions**:

#### `finalizeDailyAttendance(date)`
```javascript
export const finalizeDailyAttendance = async (date = new Date()) => {
  const dateString = getLocalDateString(date);
  
  // 1. Check if holiday/weekend
  const isHoliday = await Holiday.isHoliday(dateString);
  if (isHoliday) return { skipped: true, reason: 'holiday' };
  
  // 2. Get all active employees
  const employees = await Employee.findAll({
    where: { isActive: true, status: 'Active' }
  });
  
  // 3. Process each employee
  for (const employee of employees) {
    await finalizeEmployeeAttendance(employee, dateString, stats);
  }
  
  return stats;
};
```

**What it does**:
1. Checks if today is a holiday or weekend
2. Gets all active employees
3. Processes each employee's attendance
4. Returns statistics

#### `finalizeEmployeeAttendance(employee, dateString, stats)`
```javascript
async function finalizeEmployeeAttendance(employee, dateString, stats) {
  // 1. Find or create attendance record
  let record = await AttendanceRecord.findOne({
    where: { employeeId: employee.id, date: dateString }
  });
  
  // 2. Skip if already finalized
  if (record && record.status !== 'incomplete') {
    stats.skipped++;
    return;
  }
  
  // 3. No record at all → ABSENT
  if (!record) {
    const isOnLeave = await isEmployeeOnApprovedLeave(employee.id, dateString);
    if (isOnLeave) {
      stats.skipped++;
      return;
    }
    
    await AttendanceRecord.create({
      employeeId: employee.id,
      date: dateString,
      status: 'absent',
      statusReason: 'No clock-in recorded'
    });
    stats.absent++;
    return;
  }
  
  // 4. Clock-in but no clock-out → PENDING_CORRECTION
  if (record.clockIn && !record.clockOut) {
    record.status = 'pending_correction';
    record.statusReason = 'Missed clock-out - requires correction';
    await record.save();
    stats.pendingCorrection++;
    return;
  }
  
  // 5. Both clock-in and clock-out → Calculate status
  if (record.clockIn && record.clockOut) {
    record.calculateWorkingHours();
    
    const workedHours = record.workHours || 0;
    if (workedHours >= 8) {
      record.status = 'present';
      stats.present++;
    } else if (workedHours >= 4) {
      record.status = 'half_day';
      stats.halfDay++;
    } else {
      record.status = 'half_day';
      stats.halfDay++;
    }
    
    await record.save();
  }
}
```

**What it does**:
1. Finds or creates attendance record
2. Skips if already finalized
3. Marks ABSENT if no record
4. Marks PENDING_CORRECTION if missed clock-out
5. Calculates final status if both clock-in and clock-out

#### `scheduleAttendanceFinalization()`
```javascript
export const scheduleAttendanceFinalization = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      await finalizeDailyAttendance();
    } catch (error) {
      logger.error('Error in scheduled attendance finalization:', error);
    }
  });
  
  logger.info('✅ Attendance finalization job scheduled (every 15 minutes)');
};
```

**What it does**:
1. Schedules cron job to run every 15 minutes
2. Calls `finalizeDailyAttendance()` on each run
3. Logs errors if they occur

---

### File 2: `src/models/sequelize/AttendanceRecord.js`

**Purpose**: Data model with business logic

**Key Methods**:

#### `canClockIn()`
```javascript
AttendanceRecord.prototype.canClockIn = function () {
  // Cannot clock in if on leave/holiday
  if (['leave', 'holiday'].includes(this.status)) {
    return { allowed: false, reason: 'Cannot clock in - on leave/holiday' };
  }
  
  // Cannot clock in if already clocked in
  if (this.clockIn) {
    return { allowed: false, reason: 'Already clocked in' };
  }
  
  // Cannot clock in if day is closed
  if (['absent', 'present'].includes(this.status)) {
    return { allowed: false, reason: 'Attendance already finalized' };
  }
  
  return { allowed: true, reason: null };
};
```

**What it does**:
1. Checks if employee can clock in
2. Returns allowed status and reason
3. Prevents user errors

#### `calculateWorkingHours()`
```javascript
AttendanceRecord.prototype.calculateWorkingHours = function () {
  if (!this.clockIn || !this.clockOut) {
    this.workHours = 0;
    return 0;
  }
  
  const clockInTime = new Date(this.clockIn);
  const clockOutTime = new Date(this.clockOut);
  const totalMinutes = Math.floor((clockOutTime - clockInTime) / (1000 * 60));
  
  // Subtract break time
  const workingMinutes = Math.max(0, totalMinutes - this.totalBreakMinutes);
  
  this.totalWorkedMinutes = workingMinutes;
  this.workHours = Math.round((workingMinutes / 60) * 100) / 100;
  
  return this.workHours;
};
```

**What it does**:
1. Calculates total working hours
2. Subtracts break time
3. Updates workHours field

#### `evaluateStatus(shift)`
```javascript
AttendanceRecord.prototype.evaluateStatus = function (shift) {
  // Protected statuses - never change
  if (['leave', 'holiday'].includes(this.status)) {
    return;
  }
  
  // No clock-in = ABSENT
  if (!this.clockIn) {
    this.status = 'absent';
    this.statusReason = 'No clock-in recorded';
    return;
  }
  
  // Clock-in but no clock-out = INCOMPLETE
  if (this.clockIn && !this.clockOut) {
    this.status = 'incomplete';
    this.statusReason = 'Clock-out pending';
    return;
  }
  
  // Both clock-in and clock-out = Calculate status
  this.calculateWorkingHours();
  
  const workedHours = this.workHours || 0;
  const fullDayHours = shift?.fullDayHours || 8;
  const halfDayHours = shift?.halfDayHours || 4;
  
  if (workedHours >= fullDayHours) {
    this.status = 'present';
    this.halfDayType = 'full_day';
  } else if (workedHours >= halfDayHours) {
    this.status = 'half_day';
    this.halfDayType = this.determineHalfDayType(shift);
  } else {
    this.status = 'half_day';
    this.halfDayType = this.determineHalfDayType(shift);
  }
};
```

**What it does**:
1. Evaluates final status based on clock-in/out
2. Protects leave/holiday statuses
3. Calculates working hours
4. Determines half-day type

---

### File 3: `src/server.js`

**Purpose**: Initialize cron job on server startup

**Key Code**:
```javascript
// 🔥 CRITICAL: Initialize attendance finalization cron job
import('./jobs/attendanceFinalization.js').then((mod) => {
  if (mod && mod.scheduleAttendanceFinalization) {
    mod.scheduleAttendanceFinalization();
  }
}).catch((error) => {
  logger.warn('Attendance finalization cron job not initialized:', error.message);
});
```

**What it does**:
1. Imports finalization job
2. Calls `scheduleAttendanceFinalization()`
3. Logs errors if initialization fails

---

## 🧪 TESTING

### Run Tests
```bash
cd HRM-System/backend
npm test -- tests/final-absent-marking-test.js
```

### Manual Testing
```javascript
// 1. Import the function
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';

// 2. Run finalization
const stats = await finalizeDailyAttendance();
console.log('Stats:', stats);

// 3. Check results
const records = await AttendanceRecord.findAll({
  where: { status: 'absent' }
});
console.log('Absent records:', records);
```

---

## 🔧 EXTENDING THE SYSTEM

### Add Custom Logic

**Example: Send SMS notification**
```javascript
// In attendanceFinalization.js
async function sendAbsentNotification(employee, dateString, reason) {
  // Existing email notification
  await notificationService.sendToUser(employee.user.id, { ... });
  
  // Add SMS notification
  const smsService = (await import('../services/smsService.js')).default;
  await smsService.sendSMS(employee.phoneNumber, {
    message: `Your attendance for ${dateString} was marked as absent.`
  });
}
```

### Add Custom Status

**Example: Add 'late_absent' status**
```javascript
// In AttendanceRecord.js
AttendanceRecord.prototype.evaluateStatus = function (shift) {
  // ... existing code ...
  
  // New: Mark as late_absent if clocked in after 2 hours
  if (this.clockIn && !this.clockOut) {
    const lateThreshold = 2 * 60 * 60 * 1000; // 2 hours
    const shiftStart = new Date(`${this.date} ${shift.shiftStartTime}`);
    
    if (this.clockIn - shiftStart > lateThreshold) {
      this.status = 'late_absent';
      this.statusReason = 'Clocked in after 2 hours';
      return;
    }
  }
};
```

### Add Custom Validation

**Example: Prevent absent marking on Fridays**
```javascript
// In attendanceFinalization.js
async function finalizeEmployeeAttendance(employee, dateString, stats) {
  // Check if Friday
  const date = new Date(dateString);
  if (date.getDay() === 5) { // Friday
    logger.info(`Skipping absent marking for Friday: ${dateString}`);
    stats.skipped++;
    return;
  }
  
  // ... rest of logic ...
}
```

---

## 🐛 DEBUGGING

### Enable Debug Logging
```javascript
// In attendanceFinalization.js
if (process.env.DEBUG_ATTENDANCE === 'true') {
  console.log('🔍 [DEBUG] Processing employee:', employee.id);
  console.log('🔍 [DEBUG] Record status:', record?.status);
  console.log('🔍 [DEBUG] Clock-in:', record?.clockIn);
  console.log('🔍 [DEBUG] Clock-out:', record?.clockOut);
}
```

### Check Cron Job Status
```bash
# Check if cron is running
ps aux | grep node

# Check logs
tail -f logs/combined.log | grep "attendance"

# Check database
SELECT * FROM attendance_records WHERE status = 'absent' ORDER BY createdAt DESC LIMIT 10;
```

### Verify Finalization
```javascript
// Manual finalization with logging
const stats = await finalizeDailyAttendance();
console.log('Finalization complete:', {
  processed: stats.processed,
  absent: stats.absent,
  present: stats.present,
  errors: stats.errors
});
```

---

## 📊 MONITORING

### Key Metrics
- **Absent Count**: Number of employees marked absent
- **Pending Corrections**: Number of missed clock-outs
- **Processing Time**: How long finalization takes
- **Error Rate**: Number of errors during finalization

### Alerts to Set Up
- [ ] Absent count > 20% of employees
- [ ] Pending corrections > 10
- [ ] Processing time > 5 minutes
- [ ] Error rate > 0%

---

## 🚀 DEPLOYMENT

### Pre-Deployment
1. Run all tests
2. Check for console errors
3. Verify cron job initialization
4. Test with sample data

### Deployment Steps
1. Deploy code to production
2. Verify cron job is running
3. Monitor logs for errors
4. Check first finalization run
5. Verify absent records are created

### Post-Deployment
1. Monitor cron job logs
2. Check absent markings
3. Verify notifications
4. Monitor error rates
5. Check correction requests

---

## 📞 COMMON QUESTIONS

### Q: Why every 15 minutes?
**A**: To support multiple shifts with different timings. Each employee is finalized only after their shift ends.

### Q: What if cron job fails?
**A**: The job will retry on the next run (15 minutes later). Check logs for errors.

### Q: Can I change the schedule?
**A**: Yes, modify the cron expression in `scheduleAttendanceFinalization()`. See [cron syntax](https://crontab.guru/).

### Q: What if employee is on leave?
**A**: The system checks `LeaveRequest` table and skips marking absent.

### Q: Can I manually trigger finalization?
**A**: Yes, call `finalizeDailyAttendance()` directly or use the API endpoint.

### Q: How do I test this locally?
**A**: Run the test suite: `npm test -- tests/final-absent-marking-test.js`

---

## 🎓 LEARNING RESOURCES

- **Cron Syntax**: https://crontab.guru/
- **Sequelize Docs**: https://sequelize.org/
- **Node.js Cron**: https://github.com/kelektiv/node-cron
- **Date Handling**: https://date-fns.org/

---

## 📝 CHECKLIST FOR DEVELOPERS

- [ ] Understand the core principle
- [ ] Know the timeline
- [ ] Read the code walkthrough
- [ ] Run the tests
- [ ] Test manually
- [ ] Check the logs
- [ ] Monitor the metrics
- [ ] Set up alerts

---

**Remember**: ABSENT is a decision, not a live status. The cron job is the only source of truth.
