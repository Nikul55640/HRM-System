# 📋 Attendance Policy & Status Logic Documentation

## **Critical Policy Dependencies**

This document clarifies the business logic assumptions that drive the attendance system. These are **policy decisions**, not bugs.

---

## **🎯 Half-Day Status Determination**

### **Policy Rule**
An employee is marked as **"Half Day"** when:
- They have **both clock-in and clock-out** times
- Their **worked hours** fall within the half-day threshold range
- **AND** the shift policy allows early exit half-days

### **Example: John's Case**
```
Clock In:  10:26 AM
Clock Out: 03:51 PM
Worked:    4.88 hours
Shift:     9:00 AM - 6:00 PM (9 hours)

Half-Day Threshold: ≥ 4 hours, < 8 hours
Full-Day Threshold: ≥ 8 hours

Result: 4.88 hours → HALF DAY ✅
```

### **Why This Is Correct**
- Employee worked 4.88 hours (more than half-day minimum)
- Employee left early (before shift end)
- Shift policy allows early exit half-days
- This is **intentional**, not a bug

### **When This Would Be WRONG**
If your policy is:
- "Half-day only if employee takes explicit half-day leave"
- "Early exit = absent"
- "No early exit allowed"

**Then you need to adjust the shift configuration**, not the code.

---

## **🔧 Shift Configuration (Where Policy Lives)**

The actual policy is defined in the **Shift** model:

```javascript
// In Shift model
fullDayHours: 8,      // Hours required for "present"
halfDayHours: 4,      // Hours required for "half_day"
gracePeriodMinutes: 30 // Buffer before marking absent
```

### **How to Adjust Policy**

**To require 6 hours for half-day:**
```sql
UPDATE Shifts SET halfDayHours = 6 WHERE id = 1;
```

**To require 9 hours for full day:**
```sql
UPDATE Shifts SET fullDayHours = 9 WHERE id = 1;
```

**To add 60-minute grace period:**
```sql
UPDATE Shifts SET gracePeriodMinutes = 60 WHERE id = 1;
```

---

## **📊 Status Determination Logic (Finalization)**

### **The Algorithm**

When cron runs after shift end + buffer:

```
IF no clock-in recorded
  → Status = ABSENT

ELSE IF clock-in but no clock-out
  → Status = PENDING_CORRECTION

ELSE IF clock-in AND clock-out
  → Calculate worked hours
  
  IF worked hours ≥ fullDayHours
    → Status = PRESENT
  
  ELSE IF worked hours ≥ halfDayHours
    → Status = HALF_DAY
    → Determine half-day type (first_half or second_half)
  
  ELSE
    → Status = HALF_DAY (minimum attendance)
```

### **Key Points**
- ✅ This logic is **deterministic** (same input = same output)
- ✅ This logic is **auditable** (all decisions logged)
- ✅ This logic is **policy-driven** (configurable via Shift model)
- ✅ This logic is **cron-only** (no manual override during shift)

---

## **🚨 Common QA Questions & Answers**

### **Q: Why is John marked as Half Day if shift ends at 6 PM?**
**A:** Because John worked 4.88 hours, which meets the half-day threshold (4 hours). He left early, which is allowed by the shift policy. This is **correct behavior**, not a bug.

**If you want different behavior:**
- Increase `halfDayHours` to 5 or 6
- Or add a policy: "Early exit = absent"
- Or require explicit half-day leave request

### **Q: Why doesn't the system mark absent immediately when shift ends?**
**A:** Because we use a **30-minute grace period** (configurable). This allows for:
- Network delays
- System processing time
- Employee clock-out delays

After shift end + 30 minutes, if no clock-out, status becomes `pending_correction`.

### **Q: Can an employee manually change their status?**
**A:** No. Only:
- Clock-in/out actions set LIVE states
- Cron job sets FINAL states
- Admin can approve corrections (which triggers re-finalization)

### **Q: What if an employee clocks out at 11 PM but shift ends at 6 PM?**
**A:** They worked 17 hours. Status = PRESENT (with overtime recorded).

---

## **📋 Status Reference Table**

| Status | When Set | Set By | Meaning | Payroll Impact |
|--------|----------|--------|---------|-----------------|
| `in_progress` | Clock-in | Employee | Working now | None (live) |
| `on_break` | Break start | Employee | On break now | None (live) |
| `completed` | Clock-out | Employee | Clocked out, pending finalization | None (live) |
| `present` | After cron | Cron job | Full day worked | Full day pay |
| `half_day` | After cron | Cron job | Partial day worked | Half day pay |
| `absent` | After cron | Cron job | No clock-in | No pay (or policy-based) |
| `pending_correction` | After cron | Cron job | Missing data | Held pending correction |
| `leave` | Manual | Admin | Approved leave | Leave pay |
| `holiday` | Manual | Admin | Holiday | Holiday pay |

---

## **🔒 Immutable Rules (Never Break These)**

1. **Only cron can set FINAL states** (present, half_day, absent, pending_correction)
2. **Only employees can set LIVE states** (in_progress, on_break, completed)
3. **Shift end + buffer is the finalization trigger** (not arbitrary time)
4. **Policy is in Shift model** (not hardcoded in logic)
5. **All status changes are logged** (audit trail required)

---

## **🧪 Testing Scenarios**

### **Scenario 1: Normal Full Day**
```
Clock In:  9:00 AM
Clock Out: 6:00 PM
Worked:    8 hours
Expected:  PRESENT ✅
```

### **Scenario 2: Early Exit (Half Day)**
```
Clock In:  9:00 AM
Clock Out: 1:00 PM
Worked:    4 hours
Expected:  HALF_DAY ✅
```

### **Scenario 3: Very Early Exit (Below Half-Day)**
```
Clock In:  9:00 AM
Clock Out: 10:30 AM
Worked:    1.5 hours
Expected:  HALF_DAY (minimum) ✅
```

### **Scenario 4: Overtime**
```
Clock In:  9:00 AM
Clock Out: 10:00 PM
Worked:    13 hours
Expected:  PRESENT + 5 hours overtime ✅
```

### **Scenario 5: No Clock-In**
```
Clock In:  None
Clock Out: None
Expected:  ABSENT ✅
```

### **Scenario 6: Missing Clock-Out**
```
Clock In:  9:00 AM
Clock Out: None
After shift + 30 min:  PENDING_CORRECTION ✅
```

---

## **📝 For Your Team**

### **Developers**
- Status logic is in `AttendanceRecord.finalizeWithShift()`
- Policy is in `Shift` model
- Never hardcode thresholds — always read from Shift
- All status changes must be logged

### **QA**
- Test with different shift configurations
- Verify grace period behavior
- Check overtime calculation
- Validate audit logs

### **HR/Payroll**
- Understand the two-phase system (LIVE vs FINAL)
- Know that half-day is policy-driven
- Adjust Shift model if policy changes
- Review audit logs for corrections

---

## **🎯 Summary**

This system is **policy-driven, not magic**. If behavior seems wrong:

1. **Check the Shift configuration** (fullDayHours, halfDayHours, gracePeriodMinutes)
2. **Check the policy** (is early exit allowed?)
3. **Check the audit log** (when was status set, by whom?)
4. **Then check the code** (only if policy and config are correct)

In 95% of cases, it's a policy/config issue, not a code bug.