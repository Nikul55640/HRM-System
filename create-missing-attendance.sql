-- Create missing attendance records for January 30, 2026 (Friday - Working Day)
-- This will create "absent" records for all active employees who don't have attendance for this date

INSERT INTO attendance_records (
    employeeId,
    date,
    status,
    statusReason,
    clockIn,
    clockOut,
    workHours,
    totalWorkedMinutes,
    totalBreakMinutes,
    lateMinutes,
    earlyExitMinutes,
    overtimeMinutes,
    overtimeHours,
    isLate,
    isEarlyDeparture,
    correctionRequested,
    createdAt,
    updatedAt
)
SELECT 
    e.id as employeeId,
    '2026-01-30' as date,
    'absent' as status,
    'No clock-in recorded' as statusReason,
    NULL as clockIn,
    NULL as clockOut,
    0.00 as workHours,
    0 as totalWorkedMinutes,
    0 as totalBreakMinutes,
    0 as lateMinutes,
    0 as earlyExitMinutes,
    0 as overtimeMinutes,
    0.00 as overtimeHours,
    0 as isLate,
    0 as isEarlyDeparture,
    0 as correctionRequested,
    NOW() as createdAt,
    NOW() as updatedAt
FROM employees e
WHERE e.isActive = 1 
  AND e.status = 'Active'
  AND NOT EXISTS (
    SELECT 1 FROM attendance_records ar 
    WHERE ar.employeeId = e.id 
    AND ar.date = '2026-01-30'
  );

-- Check the results
SELECT 
    COUNT(*) as total_records,
    status,
    date
FROM attendance_records 
WHERE date = '2026-01-30'
GROUP BY status, date;