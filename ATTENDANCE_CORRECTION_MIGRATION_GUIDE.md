# 🔄 Attendance Correction Migration Guide

## 📋 Overview

This guide helps you migrate existing attendance records from the old `pending_correction` status to the new correction tracking system.

## 🎯 What Changed

### Old System (Deprecated)
```javascript
{
  status: 'pending_correction',  // ❌ Don't use anymore
  flaggedReason: 'Missing clock out'
}
```

### New System (Current)
```javascript
{
  status: 'incomplete',           // ✅ Use this
  correctionRequested: true,      // ✅ Track correction state
  correctionStatus: 'pending',    // ✅ Track approval state
  correctionReason: 'Missing clock out',
  statusReason: 'Flagged for correction by admin'
}
```

## 🔧 Migration Steps

### Step 1: Run Migration Query

Execute this SQL to migrate existing records:

```sql
-- Migrate all pending_correction records to the new system
UPDATE attendance_records
SET 
  status = 'incomplete',
  correctionRequested = true,
  correctionStatus = 'pending',
  statusReason = CONCAT('Migrated from pending_correction: ', COALESCE(flaggedReason, 'No reason provided'))
WHERE 
  status = 'pending_correction';

-- Verify migration
SELECT 
  COUNT(*) as migrated_count,
  status,
  correctionRequested,
  correctionStatus
FROM attendance_records
WHERE correctionRequested = true
GROUP BY status, correctionRequested, correctionStatus;
```

### Step 2: Verify Data Integrity

```sql
-- Check for any remaining pending_correction records
SELECT COUNT(*) as remaining_pending_correction
FROM attendance_records
WHERE status = 'pending_correction';

-- Should return 0 if migration is complete
```

### Step 3: Update Application Code

All code has been updated in the following files:
- ✅ `attendanceCorrection.controller.js`
- ✅ `attendanceCorrectionRequests.controller.js`
- ✅ `attendance.controller.js`
- ✅ `attendance.service.js`

### Step 4: Test the New System

1. **Test Flagging for Correction:**
```bash
# Flag an attendance record
POST /api/admin/attendance-corrections/:recordId/flag
{
  "reason": "Missing clock out time"
}

# Verify: status should be 'incomplete', correctionRequested should be true
```

2. **Test Applying Correction:**
```bash
# Apply correction
PUT /api/admin/attendance-corrections/:recordId/correct
{
  "checkIn": "2026-01-16T09:00:00",
  "checkOut": "2026-01-16T17:00:00",
  "breakTime": 60,
  "reason": "Corrected missing times"
}

# Verify: status should be 'incomplete', correctionStatus should be 'approved'
```

3. **Test Finalization:**
```bash
# Manually trigger finalization
POST /api/admin/attendance/finalize
{
  "date": "2026-01-16"
}

# Verify: status should be 'present', 'half_day', or 'leave' based on hours worked
```

## 📊 Database Schema Changes

### Existing Fields (No Changes Required)
```sql
-- These fields already exist in the AttendanceRecord model
correctionRequested BOOLEAN DEFAULT false
correctionStatus ENUM('pending', 'approved', 'rejected') DEFAULT NULL
correctionReason TEXT
statusReason VARCHAR(255)
```

### Status Enum (Keep for Backward Compatibility)
```sql
-- Keep pending_correction in enum for existing data
-- But never use it in new code
status ENUM(
  'present', 
  'absent', 
  'leave', 
  'half_day', 
  'holiday', 
  'incomplete', 
  'pending_correction'  -- Deprecated but kept for compatibility
)
```

## 🔍 Monitoring After Migration

### Check Correction Requests
```sql
-- View all pending corrections
SELECT 
  ar.id,
  ar.date,
  e.firstName,
  e.lastName,
  ar.status,
  ar.correctionRequested,
  ar.correctionStatus,
  ar.correctionReason
FROM attendance_records ar
JOIN employees e ON ar.employeeId = e.id
WHERE ar.correctionRequested = true
  AND ar.correctionStatus = 'pending'
ORDER BY ar.date DESC;
```

### Check Finalization Status
```sql
-- View records waiting for finalization
SELECT 
  ar.id,
  ar.date,
  e.firstName,
  e.lastName,
  ar.status,
  ar.clockIn,
  ar.clockOut,
  ar.workHours
FROM attendance_records ar
JOIN employees e ON ar.employeeId = e.id
WHERE ar.status = 'incomplete'
  AND ar.date < CURDATE()
ORDER BY ar.date DESC;
```

## 🚨 Rollback Plan (If Needed)

If you need to rollback (not recommended):

```sql
-- Rollback to old system (emergency only)
UPDATE attendance_records
SET 
  status = 'pending_correction',
  flaggedReason = correctionReason
WHERE 
  correctionRequested = true
  AND correctionStatus = 'pending';
```

## ✅ Post-Migration Checklist

- [ ] Run migration SQL query
- [ ] Verify no records have `status = 'pending_correction'`
- [ ] Test flagging for correction
- [ ] Test applying corrections
- [ ] Test finalization job
- [ ] Monitor for 24 hours
- [ ] Check reports and analytics
- [ ] Verify payroll calculations
- [ ] Update any custom queries/reports

## 📝 API Changes

### Old Endpoint Behavior (Deprecated)
```javascript
// ❌ OLD: Returns records with status = 'pending_correction'
GET /api/admin/attendance/pending-corrections
```

### New Endpoint Behavior (Current)
```javascript
// ✅ NEW: Returns records with correctionRequested = true
GET /api/admin/attendance/pending-corrections
// Now filters by: correctionRequested: true, correctionStatus: 'pending'
```

## 🎓 Training Notes for Team

### For HR/Admin Users
1. **Flagging for Correction:**
   - When you flag a record, it becomes "incomplete" (not "pending correction")
   - The system tracks it separately using correction flags
   - Finalization job will process it after approval

2. **Approving Corrections:**
   - After approval, record stays "incomplete"
   - Finalization job will re-evaluate and set final status
   - This ensures shift rules are always applied correctly

3. **Understanding Status:**
   - `incomplete` = Waiting for finalization or correction
   - `present` = Finalized as present (full day)
   - `half_day` = Finalized as half day
   - `leave` = Finalized as leave/absent

### For Developers
1. **Never set `status = 'present'` manually in corrections**
2. **Always reset to `status = 'incomplete'` after corrections**
3. **Use `correctionRequested` and `correctionStatus` for tracking**
4. **Let finalization job decide final status**
5. **Let model hooks calculate work hours**

## 📞 Support

If you encounter issues after migration:

1. Check the logs for finalization job errors
2. Verify database migration completed successfully
3. Test with a single record first
4. Review the `ATTENDANCE_CORRECTION_ARCHITECTURE_FIX.md` document

---

**Migration Date:** January 16, 2026
**Status:** ✅ Ready for deployment
**Estimated Downtime:** None (backward compatible)
