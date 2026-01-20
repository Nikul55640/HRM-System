# 📚 ABSENT MARKING - COMPLETE INDEX

This is your complete reference for the ABSENT marking system. Start here.

---

## 🎯 QUICK NAVIGATION

### For Everyone
- **[One-Line Rule](#one-line-rule)** - The core principle
- **[Timeline](#timeline)** - When things happen
- **[FAQ](#faq)** - Common questions

### For Developers
- **[Developer's Guide](./ABSENT_MARKING_DEVELOPER_GUIDE.md)** - Code walkthrough
- **[Quick Reference](./ABSENT_MARKING_QUICK_REFERENCE.md)** - Quick lookup
- **[Implementation](./ABSENT_MARKING_FINAL_IMPLEMENTATION.md)** - Full details

### For QA/Testers
- **[Verification Checklist](./ABSENT_MARKING_VERIFICATION_CHECKLIST.md)** - Test scenarios
- **[Test Suite](./backend/tests/final-absent-marking-test.js)** - Automated tests

### For HR/Admins
- **[How It Works](#how-it-works)** - Business logic
- **[What to Expect](#what-to-expect)** - User experience
- **[Correction Workflow](#correction-workflow)** - Dispute resolution

---

## 🎯 ONE-LINE RULE

**Employee is marked ABSENT only after end-of-day cron job if they never clocked in.**

---

## 🕘 TIMELINE

```
Before Shift (00:00-09:00)
├─ Status: No record / incomplete
├─ Clock-in: ✅ Allowed
└─ Marked Absent: ❌ Never

During Shift (09:00-18:00)
├─ Status: No clock-in → incomplete
├─ Late Rules: ✅ Applied
├─ UI Shows: "Not clocked in"
└─ Marked Absent: ❌ Not yet

After Shift (18:30-19:00)
├─ Status: Still incomplete
├─ Clock-in: 🔒 Locked
├─ Correction Request: ✅ Allowed
└─ Marked Absent: ❌ Not yet

End of Day (≈23:00)
├─ Cron Job Runs: ✅ Yes
├─ Status: No clock-in → ABSENT ✅
├─ Reason: "No clock-in recorded"
└─ Reversible: ✅ Yes (via correction)
```

---

## 📍 HOW IT WORKS

### Step 1: Cron Job Runs
- **When**: Every 15 minutes (shift-aware)
- **Where**: `src/jobs/attendanceFinalization.js`
- **What**: Processes all active employees

### Step 2: Check Holiday/Weekend
- **If Holiday**: Skip finalization
- **If Weekend**: Skip finalization
- **Otherwise**: Continue

### Step 3: Process Each Employee
- **No Record**: Mark ABSENT
- **Clock-in Only**: Mark PENDING_CORRECTION
- **Both Clock-in/out**: Calculate status (PRESENT/HALF_DAY)
- **On Leave**: Skip (don't mark absent)

### Step 4: Send Notifications
- **Absent**: "Your attendance was marked as absent"
- **Correction**: "Your attendance requires correction"
- **Leave**: "Your attendance was marked as leave"

### Step 5: Create Audit Trail
- **Log**: All actions
- **Timestamp**: When it happened
- **User**: Who triggered it
- **Reason**: Why it happened

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

## ✅ WHAT TO EXPECT

### As an Employee
1. **During Day**: Status shows "Not clocked in" (if you haven't clocked in)
2. **After Shift**: Status still shows "Not clocked in"
3. **After Cron**: Status changes to "Absent"
4. **Notification**: You receive notification about absent marking
5. **Correction**: You can submit correction request

### As an HR Admin
1. **Dashboard**: See absent count
2. **Reports**: Filter by absent status
3. **Corrections**: Review correction requests
4. **Override**: Approve corrections to change status
5. **Audit**: View all actions in audit log

### As a Developer
1. **Cron Job**: Runs every 15 minutes
2. **Database**: Records created/updated
3. **Logs**: All actions logged
4. **Notifications**: Sent to employees
5. **API**: Endpoints available for manual trigger

---

## 🔄 CORRECTION WORKFLOW

### Step 1: Employee Submits Correction
```
Employee Dashboard
    ↓
Attendance Page
    ↓
"Submit Correction Request"
    ↓
Select Date & Reason
    ↓
Submit
```

### Step 2: HR Reviews
```
HR Dashboard
    ↓
Attendance Corrections
    ↓
View Request Details
    ↓
Approve or Reject
```

### Step 3: Status Updated
```
If Approved:
    Attendance Record Updated
    ↓
    Status Changed to PRESENT
    ↓
    Employee Notified

If Rejected:
    Employee Notified
    ↓
    Can Submit Again
```

---

## 🚫 WHAT NOT TO DO

❌ Mark absent in real-time
❌ Mark absent from UI
❌ Mark absent at shift start
❌ Mark absent without cron
❌ Mark absent if clock-in exists
❌ Mark absent without checking leave
❌ Manually change status without correction
❌ Delete records without audit trail

---

## ✅ WHAT TO DO

✅ Let cron job handle it
✅ Check leave status first
✅ Check holiday/weekend
✅ Create correction requests
✅ Send notifications
✅ Log all actions
✅ Allow HR overrides
✅ Maintain audit trail

---

## 📁 FILE STRUCTURE

```
HRM-System/
├── ABSENT_MARKING_INDEX.md                    ← You are here
├── ABSENT_MARKING_FINAL_IMPLEMENTATION.md     ← Full details
├── ABSENT_MARKING_QUICK_REFERENCE.md          ← Quick lookup
├── ABSENT_MARKING_DEVELOPER_GUIDE.md          ← Code walkthrough
├── ABSENT_MARKING_VERIFICATION_CHECKLIST.md   ← Test scenarios
└── backend/
    ├── src/
    │   ├── jobs/
    │   │   └── attendanceFinalization.js      ← Cron job
    │   ├── models/sequelize/
    │   │   └── AttendanceRecord.js            ← Data model
    │   ├── services/admin/
    │   │   └── attendance.service.js          ← Business logic
    │   └── server.js                          ← Initialization
    └── tests/
        └── final-absent-marking-test.js       ← Test suite
```

---

## 🧪 TESTING

### Run Tests
```bash
cd HRM-System/backend
npm test -- tests/final-absent-marking-test.js
```

### Manual Test
```javascript
import { finalizeDailyAttendance } from './src/jobs/attendanceFinalization.js';
const stats = await finalizeDailyAttendance();
console.log('Stats:', stats);
```

### Check Results
```sql
SELECT * FROM attendance_records 
WHERE status = 'absent' 
ORDER BY createdAt DESC 
LIMIT 10;
```

---

## 📞 FAQ

### Q: When is employee marked absent?
**A**: Only after end-of-day cron job (≈23:00) if they never clocked in.

### Q: Can I mark absent manually?
**A**: No. Only the cron job can mark absent. This prevents errors.

### Q: What if employee is on leave?
**A**: They are skipped. Not marked absent.

### Q: What if it's a holiday?
**A**: Finalization is skipped. No one is marked absent.

### Q: What if employee clocked in late?
**A**: They are marked present (or half_day). Not absent.

### Q: Can employee dispute absent marking?
**A**: Yes. They can submit correction request.

### Q: How long does correction take?
**A**: HR reviews and approves. Usually within 1-2 days.

### Q: What if cron job fails?
**A**: It retries on next run (15 minutes later). Check logs.

### Q: Can I change the cron schedule?
**A**: Yes. Modify `scheduleAttendanceFinalization()` in `attendanceFinalization.js`.

### Q: How do I test this locally?
**A**: Run the test suite or manually call `finalizeDailyAttendance()`.

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

## 🎓 LEARNING PATH

### For Beginners
1. Read this index
2. Read [Quick Reference](./ABSENT_MARKING_QUICK_REFERENCE.md)
3. Run the tests
4. Check the logs

### For Developers
1. Read [Developer's Guide](./ABSENT_MARKING_DEVELOPER_GUIDE.md)
2. Study the code
3. Run tests
4. Extend the system

### For QA/Testers
1. Read [Verification Checklist](./ABSENT_MARKING_VERIFICATION_CHECKLIST.md)
2. Run all test scenarios
3. Check results
4. Sign off

### For HR/Admins
1. Read this index
2. Understand the timeline
3. Learn correction workflow
4. Monitor the system

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] All tests passing
- [ ] No console errors
- [ ] Cron job running
- [ ] Notifications working
- [ ] Audit logs working
- [ ] Button controls working
- [ ] Correction workflow working
- [ ] Leave verification working
- [ ] Holiday/weekend checks working
- [ ] Ready for production

---

## 📊 KEY STATISTICS

After finalization, the system tracks:

| Metric | Meaning |
|--------|---------|
| `processed` | Total employees processed |
| `skipped` | Employees whose shift not finished |
| `present` | Marked as present |
| `halfDay` | Marked as half day |
| `absent` | ✅ Marked as absent |
| `leave` | On approved leave |
| `pendingCorrection` | Missed clock-out |
| `errors` | Processing errors |

---

## 🔐 SAFETY FEATURES

✅ **Idempotent**: Running twice doesn't create duplicates
✅ **Leave-Aware**: Doesn't mark absent if on leave
✅ **Holiday-Aware**: Skips holidays and weekends
✅ **Data-Integrity**: Prevents invalid states
✅ **Auditable**: All actions logged
✅ **Reversible**: Can be corrected by HR
✅ **Notifiable**: Employees are informed
✅ **Testable**: Comprehensive test suite

---

## 📝 DOCUMENT VERSIONS

| Document | Purpose | Audience |
|----------|---------|----------|
| **Index** (this file) | Navigation & overview | Everyone |
| **Implementation** | Full technical details | Developers |
| **Quick Reference** | Quick lookup | Developers |
| **Developer Guide** | Code walkthrough | Developers |
| **Verification** | Test scenarios | QA/Testers |

---

## 🎯 NEXT STEPS

1. **Read**: Choose a document based on your role
2. **Understand**: Study the code and logic
3. **Test**: Run the test suite
4. **Deploy**: Follow deployment checklist
5. **Monitor**: Watch the logs and metrics
6. **Support**: Help others understand the system

---

## 📞 SUPPORT

**Questions?**
1. Check the FAQ above
2. Read the relevant document
3. Check the code comments
4. Review the test suite
5. Check the logs

**Issues?**
1. Check the troubleshooting section
2. Review the audit logs
3. Run the tests
4. Check the database
5. Contact the development team

---

## 🏁 SUMMARY

The ABSENT marking system is:
- ✅ **Automatic**: Runs via cron job
- ✅ **Accurate**: Based on clock-in/out data
- ✅ **Fair**: Checks leave and holidays
- ✅ **Transparent**: Sends notifications
- ✅ **Auditable**: Logs all actions
- ✅ **Reversible**: Allows corrections
- ✅ **Tested**: Comprehensive test suite
- ✅ **Production-Ready**: Ready to deploy

---

**Status**: ✅ Complete & Production Ready
**Last Updated**: January 2026
**Version**: 1.0.0

---

## 📚 DOCUMENT MAP

```
ABSENT_MARKING_INDEX.md (You are here)
├── ABSENT_MARKING_FINAL_IMPLEMENTATION.md
│   ├── Core Principle
│   ├── Timeline
│   ├── Implementation Details
│   ├── Test Scenarios
│   ├── Safety Checks
│   └── Audit Trail
├── ABSENT_MARKING_QUICK_REFERENCE.md
│   ├── One-Line Rule
│   ├── Key Logic
│   ├── What Not to Do
│   ├── Quick Test
│   └── Debug Commands
├── ABSENT_MARKING_DEVELOPER_GUIDE.md
│   ├── Quick Start
│   ├── File Structure
│   ├── Code Walkthrough
│   ├── Testing
│   ├── Extending
│   ├── Debugging
│   └── Deployment
└── ABSENT_MARKING_VERIFICATION_CHECKLIST.md
    ├── Setup Verification
    ├── Functional Verification
    ├── Safety Verification
    ├── Statistics Verification
    ├── Audit Trail Verification
    ├── Notification Verification
    └── Production Readiness
```

---

**Start with the document that matches your role. Happy coding! 🚀**
