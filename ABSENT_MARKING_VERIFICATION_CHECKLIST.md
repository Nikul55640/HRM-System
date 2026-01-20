# ✅ ABSENT MARKING - VERIFICATION CHECKLIST

Use this checklist to verify the ABSENT marking implementation is working correctly.

---

## 🔧 SETUP VERIFICATION

### Cron Job Initialization
- [ ] `src/server.js` imports `attendanceFinalization.js`
- [ ] `scheduleAttendanceFinalization()` is called
- [ ] Cron job runs every 15 minutes
- [ ] No errors in server logs

**Verify**:
```bash
# Check server logs for:
# "✅ Attendance finalization job scheduled (every 15 minutes, shift-aware)"
```

### Database Models
- [ ] `AttendanceRecord` model exists
- [ ] `Employee` model exists
- [ ] `LeaveRequest` model exists
- [ ] `Holiday` model exists
- [ ] `WorkingRule` model exists
- [ ] All models have proper associations

**Verify**:
```javascript
import { AttendanceRecord, Employee, LeaveRequest } from './src/models/index.js';
console.log(AttendanceRecord, Employee, LeaveRequest); // Should not be undefined
```

### Service Layer
- [ ] `attendanceFinalization.js` exports `finalizeDailyAttendance`
- [ ] `attendanceFinalization.js` exports `scheduleAttendanceFinalization`
- [ ] `attendanceFinalization.js` exports `checkAbsentEmployees`
- [ ] All functions are properly implemented

**Verify**:
```javascript
import { finalizeDailyAttendance, scheduleAttendanceFinalization } from './src/jobs/attendanceFinalization.js';
console.log(typeof finalizeDailyAttendance); // Should be 'function'
```

---

## 🧪 FUNCTIONAL VERIFICATION

### Test 1: No Attendance Record → ABSENT
- [ ] Delete all attendance records for a test employee on a test date
- [ ] Run finalization
- [ ] Verify record is created with status 'absent'
- [ ] Verify statusReason is 'No clock-in recorded'

**Steps**:
```javascript
// 1. Delete record
await AttendanceRecord.destroy({
  where: { employeeId: 1, date: '2024-01-15' }
});

// 2. Run finalization
await finalizeDailyAttendance(new Date('2024-01-15'));

// 3. Verify
const record = await AttendanceRecord.findOne({
  where: { employeeId: 1, date: '2024-01-15' }
});
console.assert(record.status === 'absent', 'Status should be absent');
console.assert(record.clockIn === null, 'Clock-in should be null');
console.assert(record.clockOut === null, 'Clock-out should be null');
```

**Expected Result**: ✅ Record created with status 'absent'

### Test 2: Clock-in but No Clock-out → PENDING_CORRECTION
- [ ] Create record with clock-in only
- [ ] Run finalization
- [ ] Verify status is 'pending_correction'
- [ ] Verify correction request is created

**Steps**:
```javascript
// 1. Create record with clock-in only
await AttendanceRecord.create({
  employeeId: 1,
  date: '2024-01-15',
  clockIn: new Date('2024-01-15 09:00:00'),
  clockOut: null,
  status: 'incomplete'
});

// 2. Run finalization
await finalizeDailyAttendance(new Date('2024-01-15'));

// 3. Verify
const record = await AttendanceRecord.findOne({
  where: { employeeId: 1, date: '2024-01-15' }
});
console.assert(record.status === 'pending_correction', 'Status should be pending_correction');

// 4. Verify correction request
const correction = await AttendanceCorrectionRequest.findOne({
  where: { attendanceRecordId: record.id }
});
console.assert(correction !== null, 'Correction request should be created');
```

**Expected Result**: ✅ Status changed to 'pending_correction' and correction request created

### Test 3: Both Clock-in and Clock-out → PRESENT/HALF_DAY
- [ ] Create record with both clock-in and clock-out (8+ hours)
- [ ] Run finalization
- [ ] Verify status is 'present'
- [ ] Verify workHours is calculated correctly

**Steps**:
```javascript
// 1. Create record with both
await AttendanceRecord.create({
  employeeId: 1,
  date: '2024-01-15',
  clockIn: new Date('2024-01-15 09:00:00'),
  clockOut: new Date('2024-01-15 17:00:00'),
  status: 'incomplete'
});

// 2. Run finalization
await finalizeDailyAttendance(new Date('2024-01-15'));

// 3. Verify
const record = await AttendanceRecord.findOne({
  where: { employeeId: 1, date: '2024-01-15' }
});
console.assert(record.status === 'present', 'Status should be present');
console.assert(record.workHours >= 8, 'Work hours should be 8+');
```

**Expected Result**: ✅ Status is 'present' with correct work hours

### Test 4: Employee on Approved Leave → SKIPPED
- [ ] Create approved leave request for test employee
- [ ] Delete attendance record
- [ ] Run finalization
- [ ] Verify no record is created (or record is skipped)

**Steps**:
```javascript
// 1. Create approved leave
await LeaveRequest.create({
  employeeId: 1,
  leaveType: 'casual',
  startDate: '2024-01-15',
  endDate: '2024-01-15',
  status: 'approved'
});

// 2. Delete attendance record
await AttendanceRecord.destroy({
  where: { employeeId: 1, date: '2024-01-15' }
});

// 3. Run finalization
await finalizeDailyAttendance(new Date('2024-01-15'));

// 4. Verify
const record = await AttendanceRecord.findOne({
  where: { employeeId: 1, date: '2024-01-15' }
});
console.assert(record === null || record.status !== 'absent', 'Should not be marked absent');
```

**Expected Result**: ✅ Employee on leave is not marked absent

### Test 5: Holiday → SKIPPED
- [ ] Create holiday for test date
- [ ] Delete attendance record
- [ ] Run finalization
- [ ] Verify finalization is skipped

**Steps**:
```javascript
// 1. Create holiday
await Holiday.create({
  name: 'Test Holiday',
  date: '2024-01-15',
  type: 'national'
});

// 2. Delete attendance record
await AttendanceRecord.destroy({
  where: { employeeId: 1, date: '2024-01-15' }
});

// 3. Run finalization
const result = await finalizeDailyAttendance(new Date('2024-01-15'));

// 4. Verify
console.assert(result.skipped === true, 'Should be skipped');
console.assert(result.reason === 'holiday', 'Reason should be holiday');
```

**Expected Result**: ✅ Finalization is skipped for holidays

### Test 6: Weekend → SKIPPED
- [ ] Set test date to a Saturday or Sunday
- [ ] Delete attendance record
- [ ] Run finalization
- [ ] Verify finalization is skipped

**Steps**:
```javascript
// 1. Use a Saturday (2024-01-20)
const saturdayDate = new Date('2024-01-20');

// 2. Delete attendance record
await AttendanceRecord.destroy({
  where: { employeeId: 1, date: '2024-01-20' }
});

// 3. Run finalization
const result = await finalizeDailyAttendance(saturdayDate);

// 4. Verify
console.assert(result.skipped === true, 'Should be skipped');
console.assert(result.reason === 'weekend', 'Reason should be weekend');
```

**Expected Result**: ✅ Finalization is skipped for weekends

---

## 🔐 SAFETY VERIFICATION

### Button Control Rules
- [ ] Clock-in button disabled when already clocked in
- [ ] Clock-in button disabled when on leave
- [ ] Clock-in button disabled when on holiday
- [ ] Clock-in button disabled when marked absent
- [ ] Clock-out button disabled when not clocked in
- [ ] Clock-out button disabled when already clocked out
- [ ] Clock-out button disabled when on leave
- [ ] Clock-out button disabled when on holiday

**Verify**:
```javascript
const record = await AttendanceRecord.findOne({ where: { employeeId: 1, date: '2024-01-15' } });

// Test canClockIn
const canClockIn = record.canClockIn();
console.log('Can clock in:', canClockIn.allowed, canClockIn.reason);

// Test canClockOut
const canClockOut = record.canClockOut();
console.log('Can clock out:', canClockOut.allowed, canClockOut.reason);
```

### Data Integrity
- [ ] Cannot mark absent if clock-in exists
- [ ] Cannot mark present if no clock-in
- [ ] Cannot mark half_day if no clock-in
- [ ] Cannot have clock-out without clock-in
- [ ] Cannot have negative work hours

**Verify**:
```javascript
// Try to create invalid record
try {
  await AttendanceRecord.create({
    employeeId: 1,
    date: '2024-01-15',
    clockIn: null,
    clockOut: new Date('2024-01-15 17:00:00'),
    status: 'present'
  });
  console.error('Should have thrown error');
} catch (error) {
  console.log('✅ Correctly prevented invalid state:', error.message);
}
```

---

## 📊 STATISTICS VERIFICATION

### Finalization Statistics
- [ ] `processed` count is correct
- [ ] `skipped` count is correct
- [ ] `absent` count is correct
- [ ] `present` count is correct
- [ ] `halfDay` count is correct
- [ ] `leave` count is correct
- [ ] `pendingCorrection` count is correct
- [ ] `errors` count is 0

**Verify**:
```javascript
const stats = await finalizeDailyAttendance(new Date('2024-01-15'));
console.log('Finalization stats:', stats);
console.assert(stats.errors === 0, 'Should have no errors');
console.assert(stats.processed > 0, 'Should process employees');
```

---

## 📝 AUDIT TRAIL VERIFICATION

### Audit Logs
- [ ] Absent marking is logged
- [ ] Correction requests are logged
- [ ] Notifications are logged
- [ ] All logs have timestamps
- [ ] All logs have user IDs
- [ ] All logs have action descriptions

**Verify**:
```javascript
const logs = await AuditLog.findAll({
  where: { action: 'attendance_auto_absent' },
  limit: 10
});
console.log('Audit logs:', logs);
console.assert(logs.length > 0, 'Should have audit logs');
```

---

## 🔔 NOTIFICATION VERIFICATION

### Notifications Sent
- [ ] Absent notification is sent
- [ ] Correction notification is sent
- [ ] Notifications have correct title
- [ ] Notifications have correct message
- [ ] Notifications have correct type
- [ ] Notifications are marked as unread

**Verify**:
```javascript
const notifications = await Notification.findAll({
  where: { userId: 1, category: 'attendance' },
  limit: 10
});
console.log('Notifications:', notifications);
console.assert(notifications.length > 0, 'Should have notifications');
```

---

## 🚀 PRODUCTION READINESS

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] No database errors
- [ ] Cron job running
- [ ] Notifications working
- [ ] Audit logs working
- [ ] Button controls working
- [ ] Correction workflow working
- [ ] Leave verification working
- [ ] Holiday/weekend checks working

### Post-Deployment Verification
- [ ] Monitor cron job logs
- [ ] Check for absent markings
- [ ] Verify notifications are sent
- [ ] Check correction requests
- [ ] Monitor error rates
- [ ] Verify audit trail
- [ ] Test with real employees
- [ ] Verify UI reflects changes

---

## 📋 SIGN-OFF

- [ ] All tests passed
- [ ] All verifications completed
- [ ] No critical issues found
- [ ] Ready for production

**Verified By**: _______________
**Date**: _______________
**Notes**: _______________

---

## 🆘 TROUBLESHOOTING

### Issue: Tests failing
**Solution**: 
1. Check database connection
2. Verify models are loaded
3. Check for migration errors
4. Review test logs

### Issue: Cron job not running
**Solution**:
1. Check `src/server.js` initialization
2. Verify `node-cron` is installed
3. Check server logs
4. Restart server

### Issue: Absent records not created
**Solution**:
1. Verify finalization is running
2. Check if employees are active
3. Verify leave requests
4. Check holiday/weekend settings

### Issue: Notifications not sent
**Solution**:
1. Verify notification service is initialized
2. Check user IDs are correct
3. Verify email/SMS configuration
4. Check notification logs

---

**Status**: Ready for Verification
**Last Updated**: January 2026
