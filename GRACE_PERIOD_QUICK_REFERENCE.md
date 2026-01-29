# Grace Period + Auto-Finalize - Quick Reference

## 🎯 Two Rules Implemented

### Rule 1: Grace Period (Shift End + 15 min)
```
Employee CAN clock out until: Shift End + 15 minutes
After that: ❌ BLOCKED → Correction request required
```

### Rule 2: Auto-Finalize (Shift End + 30 min)
```
If NO clock-out by: Shift End + 30 minutes
System: Auto clock-out at shift end + Finalize status
```

---

## 📍 Files Modified

| File | Change | Lines |
|------|--------|-------|
| `AttendanceRecord.js` | Updated `canClockOut(shift)` | ~285-350 |
| `attendance.service.js` | Pass shift to `canClockOut()` | ~202, ~594 |
| `attendanceFinalization.js` | Added `autoFinalizeMissedClockOuts()` | ~1-100 |

---

## 🔄 How It Works

### Grace Period Flow
```
17:00 Shift Ends
  ↓
17:00-17:15 Grace Window (15 min)
  ├─ Clock-out at 17:10 → ✅ ALLOWED
  ├─ Clock-out at 17:15 → ✅ ALLOWED
  └─ Clock-out at 17:16 → ❌ BLOCKED
```

### Auto-Finalize Flow
```
17:00 Shift Ends
  ↓
17:30 Auto-Finalize Threshold (Shift + 30 min)
  ↓
If NO clock-out by 17:30:
  ├─ Auto clock-out: 17:00 (shift end)
  ├─ Calculate hours
  ├─ Finalize status
  └─ Send notification
```

---

## 💻 Code Changes

### 1. canClockOut() - Now Takes Shift Parameter
```javascript
// BEFORE
const canClockOut = attendanceRecord.canClockOut();

// AFTER
const canClockOut = attendanceRecord.canClockOut(shift);
```

### 2. Grace Period Check
```javascript
// Shift end + 15 minutes
const graceLimit = new Date(shiftEnd.getTime() + 15 * 60 * 1000);

if (now > graceLimit) {
  return {
    allowed: false,
    reason: `Clock-out window expired (15 min after shift end at ${shift.shiftEndTime})`
  };
}
```

### 3. Auto-Finalize Check
```javascript
// Shift end + 30 minutes
const autoFinalizeTime = new Date(shiftEnd.getTime() + 30 * 60 * 1000);

if (now >= autoFinalizeTime) {
  // Auto clock-out at shift end (not current time)
  record.clockOut = shiftEnd;
  await record.finalizeWithShift(shift);
}
```

---

## 🧪 Quick Test

### Test Grace Period
```bash
# Setup
- Shift: 09:00 - 17:00
- Clock-in: 09:15
- Current time: 17:10

# Expected
- Clock-out: ✅ ALLOWED
- Status: HALF_DAY or PRESENT
```

### Test Auto-Finalize
```bash
# Setup
- Shift: 09:00 - 17:00
- Clock-in: 09:15
- No clock-out
- Current time: 17:35

# Expected
- Auto clock-out: 17:00
- Status: HALF_DAY (7.5 hours)
- Notification: Sent
```

---

## ⚙️ Configuration

### Change Grace Period Duration
**File**: `AttendanceRecord.js` Line ~330
```javascript
// Current: 15 minutes
const graceLimit = new Date(shiftEnd.getTime() + 15 * 60 * 1000);
                                                    ^^
                                            Change this value
```

### Change Auto-Finalize Threshold
**File**: `attendanceFinalization.js` Line ~50
```javascript
// Current: 30 minutes
const autoFinalizeTime = new Date(shiftEnd.getTime() + 30 * 60 * 1000);
                                                        ^^
                                                Change this value
```

### Change Cron Schedule
**File**: `attendanceFinalization.js` Line ~600
```javascript
// Current: Every 15 minutes
cron.schedule('*/15 * * * *', async () => {
               ^^^^
            Change this pattern
});
```

---

## 🔍 Monitoring

### Check Logs
```bash
# Look for auto-finalize events
grep "Auto-finalized" logs/combined.log

# Look for grace period blocks
grep "Clock-out window expired" logs/combined.log

# Look for errors
grep "Error" logs/error.log
```

### Database Query
```sql
-- Find auto-finalized records
SELECT * FROM attendance_records 
WHERE statusReason LIKE '%Auto clock-out%'
ORDER BY date DESC;

-- Find records with grace period blocks
SELECT * FROM attendance_records 
WHERE status = 'pending_correction' 
AND statusReason LIKE '%Missed clock-out%'
ORDER BY date DESC;
```

---

## 🛡️ Safety Features

✅ **Shift-Aware**: Each employee finalized after their shift ends  
✅ **Idempotent**: Won't double-process records  
✅ **Payroll-Safe**: Uses shift end time (not current time)  
✅ **Non-Blocking**: Notification failures don't stop finalization  
✅ **Error-Tolerant**: Graceful handling of edge cases  

---

## 📊 Expected Behavior

| Scenario | Grace Period | Auto-Finalize | Result |
|----------|--------------|---------------|--------|
| Clock-out at 17:10 | ✅ Allowed | N/A | HALF_DAY |
| Clock-out at 17:20 | ❌ Blocked | N/A | Correction |
| No clock-out by 17:30 | N/A | ✅ Triggered | HALF_DAY |
| No clock-out by 17:20 | N/A | ❌ Not yet | Incomplete |

---

## 🚀 Deployment

- ✅ No database migration needed
- ✅ No frontend changes required
- ✅ Cron job already running
- ✅ Backward compatible
- ✅ Ready for production

---

## 📞 Support

### Issue: Clock-out blocked but should be allowed
**Check**: Is current time within grace period (Shift End + 15 min)?

### Issue: Auto-finalize not happening
**Check**: Is current time past threshold (Shift End + 30 min)?  
**Check**: Is cron job running? (`*/15 * * * *`)

### Issue: Wrong status after auto-finalize
**Check**: Are work hours calculated correctly?  
**Check**: Are shift thresholds configured correctly?

---

**Status**: ✅ READY FOR PRODUCTION  
**Last Updated**: January 29, 2026
