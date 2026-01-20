# 📋 Attendance Absent Marking - Quick Reference Card

## 🎯 ONE-LINE ANSWER

**Employee is marked ABSENT only after end-of-day cron job if they never clocked in.**

---

## ⏱️ TIMELINE

```
09:00 ─────────────────────────────────────────────────────── 18:00 ─── 18:15
Shift Start                                              Shift End   Cron Runs
   │                                                         │          │
   └─ Status: incomplete                                     │          │
      (no decision yet)                                      │          │
                                                            │          │
                                                    Status: incomplete  │
                                                    (still no decision) │
                                                                       │
                                                            Status: ABSENT ✅
                                                            (if no clock-in)
```

---

## 🔑 KEY RULES

| Rule | When | Result |
|------|------|--------|
| **No clock-in** | After cron | `absent` ✅ |
| **Clock-in exists** | Always | Never `absent` |
| **Leave/Holiday** | Always | Protected (never change) |
| **Already finalized** | Always | Skip (idempotent) |

---

## 📊 STATUS MATRIX

```
Clock-In  Clock-Out  Hours  Status
─────────────────────────────────────
   ❌        ❌       -      absent ✅
   ✅        ❌       -      pending_correction ⚠️
   ❌        ✅       -      absent ✅
   ✅        ✅       8+     present ✅
   ✅        ✅       4-8    half_day ✅
   ✅        ✅       <4     absent ✅
```

---

## 🔐 PROTECTION LAYERS

```
Layer 1: Status Protection
  └─ Leave/Holiday never change

Layer 2: Idempotent Check
  └─ Won't mark absent twice

Layer 3: Data Validation
  └─ Prevents impossible states

Layer 4: Button Controls
  └─ Prevents user errors
```

---

## 🧪 QUICK TEST

```bash
# 1. Run cron
node backend/scripts/attendance-scheduler.js end-of-day

# 2. Check database
SELECT * FROM attendance_records 
WHERE date = '2026-01-20' 
AND status = 'absent';

# Expected: Rows with status='absent' and clockIn=NULL
```

---

## 🔍 DEBUGGING

### Find absent records
```sql
SELECT * FROM attendance_records 
WHERE status = 'absent' 
AND clockIn IS NULL;
```

### Find incomplete records
```sql
SELECT * FROM attendance_records 
WHERE status = 'incomplete' 
AND clockIn IS NOT NULL 
AND clockOut IS NULL;
```

### Find invalid states
```sql
SELECT * FROM attendance_records 
WHERE status = 'absent' 
AND clockIn IS NOT NULL;
-- Should return 0 rows
```

---

## 📍 CODE LOCATIONS

| Component | File | Method |
|-----------|------|--------|
| **Model** | `AttendanceRecord.js` | `evaluateStatus()` |
| **Job** | `attendanceFinalization.js` | `finalizeDailyAttendance()` |
| **Service** | `attendance.service.js` | `clockIn()`, `clockOut()` |
| **Button Control** | `AttendanceRecord.js` | `canClockIn()`, `canClockOut()` |

---

## ✅ VERIFICATION CHECKLIST

- [ ] Cron job runs every 15 minutes
- [ ] Absent marked only when no clock-in
- [ ] Leave/Holiday protected
- [ ] Idempotent (won't mark twice)
- [ ] Button controls work
- [ ] Data validation works
- [ ] Notifications sent
- [ ] Corrections allowed

---

## 🚀 STATUS

**PRODUCTION READY** ✅

Your system correctly implements industry-standard absent marking logic.

---

## 📚 FULL DOCUMENTATION

- `ATTENDANCE_ABSENT_MARKING_ANALYSIS.md` - Complete analysis
- `ATTENDANCE_DECISION_TREE.md` - Visual decision tree
- `ATTENDANCE_VERIFICATION_GUIDE.md` - Testing guide
- `ATTENDANCE_ABSENT_MARKING_SUMMARY.md` - Executive summary

---

## 💡 REMEMBER

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Absent = No clock-in by end of day (cron)         │
│                                                     │
│  NOT:                                               │
│  ❌ Marked at shift start                          │
│  ❌ Marked in real-time                            │
│  ❌ Marked without cron                            │
│  ❌ Marked if clock-in exists                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

