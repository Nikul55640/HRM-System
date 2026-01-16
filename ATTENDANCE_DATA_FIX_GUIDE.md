# Attendance Data Fix Guide

## Problem

The attendance summary shows impossible work hours:
- **144 hours** worked in **6 days** = **24 hours per day**
- **Work Completion: 225%** (more than double expected)
- **Avg Hours/Day: 24.0h** (working 24/7 non-stop)

This indicates **corrupted or test data** in the database.

---

## Quick Fix Options

### Option 1: Clear All Attendance Data (Recommended for Testing)

**Use this if:** You're in development/testing and want to start fresh.

```bash
cd HRM-System/backend
node scripts/clear-attendance-data.js
```

**What it does:**
- Deletes ALL attendance records
- Gives you a clean slate
- You can start tracking attendance from scratch

---

### Option 2: Fix Corrupted Records (Keep Valid Data)

**Use this if:** You have some valid data you want to keep.

```bash
cd HRM-System/backend
node scripts/fix-attendance-data.js
```

**What it does:**
- Finds records with impossible work hours (>24h/day)
- Recalculates work hours based on actual clock in/out times
- Caps work hours to realistic maximum (16 hours)
- Deletes records with no clock-in time
- Sets incomplete records to 0 hours

---

## Understanding the Data Issues

### What Causes This?

1. **Test/Seed Data**
   - Automated test data with random values
   - Seed scripts that don't validate realistic hours

2. **Calculation Bugs**
   - Clock in/out times in wrong timezone
   - Minutes being treated as hours (or vice versa)
   - Break time being added instead of subtracted

3. **Manual Data Entry Errors**
   - Admin entering incorrect values
   - Copy-paste errors in bulk imports

### How to Identify Bad Data

Check your database for records where:
```sql
SELECT * FROM AttendanceRecords 
WHERE totalWorkedMinutes > 1440  -- More than 24 hours
ORDER BY totalWorkedMinutes DESC;
```

---

## Prevention

### 1. Add Database Constraints

Add a check constraint to prevent impossible values:

```sql
ALTER TABLE AttendanceRecords 
ADD CONSTRAINT check_realistic_hours 
CHECK (totalWorkedMinutes <= 1440);  -- Max 24 hours
```

### 2. Add Backend Validation

The `AttendanceRecord` model already has validation in the `beforeSave` hook, but you can add extra checks:

```javascript
// In AttendanceRecord.js
beforeSave: async (record) => {
  // ... existing code ...
  
  // Validate realistic work hours
  if (record.totalWorkedMinutes > 1440) {
    throw new Error('Work hours cannot exceed 24 hours per day');
  }
  
  if (record.totalWorkedMinutes > 960) {
    console.warn(`⚠️  Very long work day: ${record.totalWorkedMinutes/60}h`);
  }
}
```

### 3. Frontend Validation

The `AttendanceSummary` component now includes:
- ✅ Automatic detection of impossible values
- ✅ Capping to realistic limits (24h/day max)
- ✅ Warning banner for users
- ✅ Console logging for debugging

---

## Realistic Work Hour Limits

| Scenario | Hours | Minutes | Notes |
|----------|-------|---------|-------|
| Normal Day | 8-9h | 480-540 | Standard work day |
| Long Day | 10-12h | 600-720 | With overtime |
| Very Long Day | 13-16h | 780-960 | Extreme cases |
| **Maximum Possible** | **24h** | **1440** | Physically impossible to exceed |

---

## Testing After Fix

### 1. Check the Database

```bash
cd HRM-System/backend
node -e "
const { AttendanceRecord } = require('./src/models/sequelize/index.js');
AttendanceRecord.findAll({
  attributes: ['id', 'date', 'totalWorkedMinutes', 'workHours'],
  order: [['totalWorkedMinutes', 'DESC']],
  limit: 10
}).then(records => {
  console.log('Top 10 records by work hours:');
  records.forEach(r => {
    console.log(\`  \${r.date}: \${(r.totalWorkedMinutes/60).toFixed(1)}h\`);
  });
  process.exit(0);
});
"
```

### 2. Check the Frontend

1. Login to the application
2. Go to **Attendance** page
3. Check the **Attendance Summary**
4. Verify:
   - ✅ No "Data Error" warning banner
   - ✅ Realistic work hours (< 16h/day)
   - ✅ Work completion < 150%
   - ✅ Average hours/day < 12h

### 3. Create New Attendance Records

Test with realistic data:
```javascript
// Clock in at 9:00 AM
// Clock out at 5:00 PM
// Break: 30 minutes
// Expected: 7.5 hours worked
```

---

## Manual Database Fix (SQL)

If you prefer to fix directly in the database:

### Delete All Attendance Records
```sql
DELETE FROM AttendanceRecords;
```

### Delete Only Corrupted Records
```sql
DELETE FROM AttendanceRecords 
WHERE totalWorkedMinutes > 1440;
```

### Cap Work Hours to 16h Maximum
```sql
UPDATE AttendanceRecords 
SET 
  totalWorkedMinutes = 960,  -- 16 hours
  workHours = 16.0
WHERE totalWorkedMinutes > 960;
```

### Recalculate Work Hours
```sql
UPDATE AttendanceRecords 
SET 
  totalWorkedMinutes = TIMESTAMPDIFF(MINUTE, clockIn, clockOut) - totalBreakMinutes,
  workHours = (TIMESTAMPDIFF(MINUTE, clockIn, clockOut) - totalBreakMinutes) / 60.0
WHERE clockIn IS NOT NULL 
  AND clockOut IS NOT NULL
  AND totalWorkedMinutes > 1440;
```

---

## Root Cause Investigation

### Check Seed Data

Look at `backend/seeds/` files:
```bash
grep -r "totalWorkedMinutes" backend/seeds/
```

### Check Test Data

Look at test files:
```bash
grep -r "totalWorkedMinutes" backend/tests/
```

### Check Attendance Calculation

The calculation happens in:
- `backend/src/models/sequelize/AttendanceRecord.js` (beforeSave hook)
- `backend/src/services/admin/attendance.service.js` (clock in/out logic)

---

## Expected Behavior After Fix

### Attendance Summary Should Show:
- **Total Hours Worked**: 40-50h per week (8-10h/day × 5 days)
- **Work Completion**: 90-110% (close to expected)
- **Avg Hours/Day**: 8-10h (realistic work day)
- **No warning banner** about data errors

### Example of Good Data:
```
Work Hours Analysis - January 2026
Total Hours Worked:      48.0h
Expected Hours (Month):  64.0h
Work Completion:         75.0%
Avg Hours/Day:           8.0h
Working Days:            6 / 8
Overtime Hours:          0.0h
Break Time:              3 hours
```

---

## Support

If issues persist after running the fix scripts:

1. **Check backend logs** for calculation errors
2. **Inspect database** for remaining bad records
3. **Review clock in/out times** for timezone issues
4. **Check seed/test data** for unrealistic values

---

## Summary

✅ **Frontend now validates and caps** unrealistic values
✅ **Warning banner alerts users** to data issues  
✅ **Fix scripts available** to clean database
✅ **Prevention measures** documented

**Recommended Action**: Run `clear-attendance-data.js` to start fresh with clean data.
