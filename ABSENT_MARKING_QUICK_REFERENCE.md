# ⚡ ABSENT MARKING - QUICK REFERENCE

## 🎯 ONE-LINE RULE

**Employee is marked ABSENT only after end-of-day cron job if they never clocked in.**

---

## 📍 WHERE IT HAPPENS

| Component | File | Function |
|-----------|------|----------|
| **Cron Job** | `src/jobs/attendanceFinalization.js` | `finalizeDailyAttendance()` |
| **Employee Processing** | `src/jobs/attendanceFinalization.js` | `finalizeEmployeeAttendance()` |
| **Data Model** | `src/models/sequelize/AttendanceRecord.js` | Instance methods |
| **Initialization** | `src/server.js` | `scheduleAttendanceFinalization()` |

---

## 🕐 WHEN IT HAPPENS

- **Frequency**: Every 15 minutes (shift-aware)
- **Time**: Typically after 23:00 (11 PM)
- **Trigger**: Automatic cron job
- **Manual**: `POST /api/admin/attendance-finalization/manual`

---

## 📊 STATUS FLOW

```
No Record
    ↓
    ├─→ On Leave? → SKIP
    ├─→ Holiday? → SKIP
    └─→ No Clock-in? → ABSENT ✅
    
Clock-in Only
    ↓
    └─→ PENDING_CORRECTION

Clock-in + Clock-out
    ↓
    ├─→ 8+ hours? → PRESENT
    ├─→ 4-8 hours? → HALF_DAY
    └─→ <4 hours? → HALF_DAY
```

---

## 🔍 KEY LOGIC

### Case 1: No Record at All
```javascript
if (!record) {
  // Check if on leave
  if (isOnLeave) return; // Skip
  
  // Mark ABSENT
  await AttendanceRecord.create({
    status: 'absent',
    statusReason: 'No clock-in recorded'
  });
}
```

### Case 2: Clock-in but No Clock-out
```javascript
if (record.clockIn && !record.clockOut) {
  record.status = 'pending_correction';
  record.statusReason = 'Missed clock-out - requires correction';
  await record.save();
}
```

### Case 3: Both Clock-in and Clock-out
```javascript
if (record.clockIn && record.clockOut) {
  record.calculateWorkingHours();
  
  if (workHours >= 8) {
    record.status = 'present';
  } else if (workHours >= 4) {
    record.status = 'half_day';
  } else {
    record.status = 'half_day';
  }
  await record.save();
}
```

---

## 🚫 WHAT NOT TO DO

❌ Mark absent in real-time
❌ Mark absent from UI
❌ Mark absent at shift start
❌ Mark absent without cron
❌ Mark absent if clock-in exists
❌ Mark absent without checking leave

---

## ✅ WHAT TO DO

✅ Let cron job handle it
✅ Check leave status first
✅ Check holiday/weekend
✅ Create correction requests
✅ Send notifications
✅ Log all actions
✅ Allow HR overrides

---

## 🧪 QUICK TEST

```bash
# Run test suite
npm test -- tests/final-absent-marking-test.js

# Manual finalization (for testing)
curl -X POST http://localhost:5000/api/admin/attendance-finalization/manual

# Check absent employees
curl http://localhost:5000/api/admin/attendance-finalization/check-absent
```

---

## 📋 CHECKLIST FOR DEVELOPERS

- [ ] Cron job is running (check logs)
- [ ] No clock-in records are being created prematurely
- [ ] Absent records are created only after cron runs
- [ ] Leave verification is working
- [ ] Notifications are being sent
- [ ] Audit logs are being created
- [ ] Button controls prevent user errors
- [ ] Correction workflow is enabled

---

## 🔗 RELATED ENDPOINTS

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/attendance-finalization/manual` | POST | Manually trigger finalization |
| `/api/admin/attendance-finalization/check-absent` | GET | Check absent employees |
| `/api/admin/attendance-corrections` | POST | Create correction request |
| `/api/employee/attendance/today` | GET | Get today's status |
| `/api/employee/attendance/summary/:year/:month` | GET | Get monthly summary |

---

## 💡 COMMON ISSUES

### Issue: Employee marked absent but they clocked in
**Solution**: Check if clock-in was recorded before cron ran. If yes, it's a data error. Use correction request.

### Issue: Cron job not running
**Solution**: Check `src/server.js` - ensure `scheduleAttendanceFinalization()` is called. Check logs for errors.

### Issue: Employee on leave still marked absent
**Solution**: Verify leave request is approved and date range is correct. Check `LeaveRequest` table.

### Issue: Pending correction not created
**Solution**: Check if `AttendanceCorrectionRequest` model is imported. Verify employee has user linked.

---

## 📞 DEBUG COMMANDS

```javascript
// Check if cron is running
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
await finalizeDailyAttendance();

// Check specific employee
const record = await AttendanceRecord.findOne({
  where: { employeeId: 1, date: '2024-01-15' }
});
console.log(record);

// Check leave status
const leave = await LeaveRequest.findOne({
  where: { employeeId: 1, status: 'approved' }
});
console.log(leave);

// Check correction requests
const corrections = await AttendanceCorrectionRequest.findAll({
  where: { employeeId: 1 }
});
console.log(corrections);
```

---

## 🎓 MENTAL MODEL

Think of ABSENT marking like a **court verdict**:

1. **Investigation Phase** (during day): Employee status is "incomplete" - we're still gathering evidence
2. **Evidence Collection** (shift end): We check if they clocked in
3. **Verdict** (cron job): If no clock-in, we declare them "absent"
4. **Appeal** (correction request): Employee can appeal the verdict
5. **Reversal** (HR approval): HR can overturn the verdict

**Key**: The verdict is only final after the cron job runs. Never before.

---

**Remember**: ABSENT is a decision, not a live status.
