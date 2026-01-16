# ⚡ Attendance Correction Quick Reference

## 🎯 Golden Rules (Print This!)

```
┌─────────────────────────────────────────────────────────────┐
│  🚫 NEVER DO THIS                                           │
├─────────────────────────────────────────────────────────────┤
│  ❌ status: 'pending_correction'                            │
│  ❌ status: 'present' (after correction)                    │
│  ❌ Calculate workHours in controllers                      │
│  ❌ Bypass finalization job                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✅ ALWAYS DO THIS                                          │
├─────────────────────────────────────────────────────────────┤
│  ✅ status: 'incomplete' (after correction)                 │
│  ✅ correctionRequested: true                               │
│  ✅ correctionStatus: 'pending'|'approved'|'rejected'       │
│  ✅ Let model hooks calculate workHours                     │
│  ✅ Let finalization job set final status                   │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Code Templates

### Flag for Correction
```javascript
await record.update({
  correctionRequested: true,
  correctionStatus: 'pending',
  correctionReason: reason,
  status: 'incomplete',
  statusReason: 'Flagged for correction by admin',
  flaggedBy: req.user.id,
  flaggedAt: new Date()
});
```

### Apply Correction
```javascript
await record.update({
  clockIn: newClockIn,
  clockOut: newClockOut,
  totalBreakMinutes: newBreakTime,
  status: 'incomplete',
  statusReason: 'Correction applied - pending re-evaluation',
  correctionReason: reason,
  correctionStatus: 'approved',
  correctedBy: req.user.id,
  correctedAt: new Date()
});
// Model hooks will calculate workHours automatically
```

### Query Pending Corrections
```javascript
const whereClause = {
  correctionRequested: true,
  correctionStatus: 'pending'
};
// NOT: status: 'pending_correction'
```

## 🔄 Status Flow

```
Clock In → 'present' (temporary)
    ↓
Clock Out → 'incomplete' (waiting)
    ↓
Correction? → correctionRequested: true, status: 'incomplete'
    ↓
Approved → status: 'incomplete' (still waiting)
    ↓
Finalization Job → 'present' | 'half_day' | 'leave'
```

## 🎭 Roles & Responsibilities

| Component | Responsibility | What NOT to Do |
|-----------|---------------|----------------|
| **Controller** | HTTP only | ❌ Calculate hours |
| **Service** | Business logic | ❌ Set final status |
| **Model Hooks** | Calculate hours | ❌ Set status |
| **Finalization Job** | Final status | ❌ Nothing, it's perfect! |

## 🔍 Debugging Checklist

```
□ Is status = 'incomplete' after correction?
□ Is correctionRequested = true?
□ Is correctionStatus set correctly?
□ Did model hooks calculate workHours?
□ Did finalization job run?
□ Is shift assignment correct?
□ Is shift end time passed?
```

## 📊 Database Fields

### Correction Tracking
```javascript
correctionRequested: Boolean    // Is correction needed?
correctionStatus: Enum          // 'pending', 'approved', 'rejected'
correctionReason: String        // Why correction needed
correctedBy: Integer            // User ID who corrected
correctedAt: DateTime           // When corrected
```

### Status Tracking
```javascript
status: Enum                    // Current status
statusReason: String            // Why this status
```

## 🚨 Common Mistakes

### Mistake 1: Setting status = 'present'
```javascript
// ❌ WRONG
await record.update({
  clockIn: newTime,
  status: 'present'  // DON'T DO THIS!
});

// ✅ CORRECT
await record.update({
  clockIn: newTime,
  status: 'incomplete'  // Let finalization decide
});
```

### Mistake 2: Manual Calculation
```javascript
// ❌ WRONG
const hours = (clockOut - clockIn) / 3600000;
await record.update({ workHours: hours });

// ✅ CORRECT
await record.update({ clockIn, clockOut });
// Model hooks calculate automatically
```

### Mistake 3: Using pending_correction
```javascript
// ❌ WRONG
WHERE status = 'pending_correction'

// ✅ CORRECT
WHERE correctionRequested = true 
  AND correctionStatus = 'pending'
```

## 🎯 Quick Decision Tree

```
Need to correct attendance?
    ↓
Is it a new correction request?
    ├─ Yes → Set correctionRequested: true, status: 'incomplete'
    └─ No → Is it approval?
           ├─ Yes → Update times, status: 'incomplete'
           └─ No → Is it rejection?
                  └─ Yes → Set correctionStatus: 'rejected'
```

## 📞 When in Doubt

1. **Check the status:** Should be `incomplete` after any correction
2. **Check the flags:** `correctionRequested` and `correctionStatus`
3. **Let the job run:** Finalization job handles final status
4. **Trust the hooks:** Model hooks calculate work hours

## 🔗 Related Documents

- `ATTENDANCE_CORRECTION_ARCHITECTURE_FIX.md` - Full explanation
- `ATTENDANCE_CORRECTION_MIGRATION_GUIDE.md` - Migration steps
- `ATTENDANCE_FINALIZATION_COMPLETE.md` - Finalization job details

---

**Keep this handy!** Print it, bookmark it, tattoo it on your arm! 😄
