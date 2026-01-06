# Enhanced Attendance Automation System

This document explains the enhanced attendance automation features that automatically handle absent employees, half-day detection, and half-day type classification.

## 🆕 New Features

### 1. **Automatic Absent Detection**
- **When**: Employees who don't clock in by threshold time
- **Threshold**: Shift start time + grace period + 1 hour
- **Action**: Creates attendance record with status "absent"
- **Notification**: Alerts HR/Admin and optionally the employee

### 2. **Automatic Half-Day Detection**
- **When**: Employee works less than full-day hours but more than minimum
- **Logic**: Based on `workHours` vs `shift.fullDayHours` and `shift.halfDayHours`
- **Action**: Updates status to "half_day" and determines type
- **Notification**: Alerts employee and HR/Admin

### 3. **Half-Day Type Classification**
- **First Half**: When clock-in is before shift midpoint
- **Second Half**: When clock-in is after shift midpoint
- **Full Day**: When worked hours >= full day requirement

## 📊 Status Logic

```
if (workedHours >= fullDayHours) {
  status = "present"
  halfDayType = "full_day"
} else if (workedHours >= halfDayHours) {
  status = "half_day"
  halfDayType = "first_half" | "second_half" (based on timing)
} else {
  status = "half_day" (insufficient hours)
  halfDayType = "first_half" | "second_half" (based on timing)
}
```

## 🔄 Automated Processes

### Process 1: Absent Employee Detection
**Frequency**: Every 2 hours during work day (9 AM - 6 PM)
**Trigger**: `POST /api/admin/attendance/check-absent`

```bash
# Manual trigger
curl -X POST http://localhost:3000/api/admin/attendance/check-absent
```

### Process 2: End-of-Day Processing
**Frequency**: Daily at 11 PM
**Trigger**: `POST /api/admin/attendance/process-end-of-day`

```bash
# Manual trigger
curl -X POST http://localhost:3000/api/admin/attendance/process-end-of-day
```

### Process 3: Half-Day Detection
**Frequency**: Real-time (on clock-out)
**Trigger**: Automatic when attendance record is saved with both clock-in and clock-out

## 🗄️ Database Changes

### New Column: `halfDayType`
```sql
ALTER TABLE attendance_records 
ADD COLUMN halfDayType ENUM('first_half', 'second_half', 'full_day') 
COMMENT 'Type of half day attendance';
```

**Migration**: Run `node run-half-day-type-migration.js`

## 📱 Notifications

### Absent Employee Notification
- **To HR/Admin**: "Employee Marked Absent"
- **To Employee**: "Attendance Alert" (optional)
- **Type**: Error
- **Category**: attendance

### Half-Day Detection Notification
- **To Employee**: "Half Day Recorded"
- **To HR/Admin**: "Half Day Detected"
- **Type**: Info
- **Category**: attendance

### Late Clock-in Notification (Existing)
- **To Employee**: "Late Clock-in Recorded"
- **To HR/Admin**: "Late Clock-in Alert"
- **Type**: Warning
- **Category**: attendance

## 🛠️ Setup Instructions

### 1. Run Database Migration
```bash
cd HRM-System/backend
node run-half-day-type-migration.js
```

### 2. Test the System
```bash
node test-attendance-automation.js
```

### 3. Setup Automated Scheduling

#### Option A: Cron Jobs (Linux/Mac)
```bash
crontab -e
```

Add these lines:
```bash
# Check for absent employees every 2 hours (9 AM to 6 PM, weekdays)
0 9,11,13,15,17 * * 1-5 cd /path/to/HRM-System/backend && node -e "
import('./src/services/admin/attendance.service.js').then(m => {
  const service = new m.default();
  service.checkAbsentEmployees().then(console.log);
});"

# Process end-of-day at 11 PM (weekdays)
0 23 * * 1-5 cd /path/to/HRM-System/backend && node -e "
import('./src/services/admin/attendance.service.js').then(m => {
  const service = new m.default();
  service.processEndOfDayAttendance().then(console.log);
});"
```

#### Option B: Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task: "Check Absent Employees"
3. Trigger: Daily, repeat every 2 hours from 9 AM to 6 PM
4. Action: Start program `node`
5. Arguments: `test-attendance-automation.js`
6. Start in: `C:\path\to\HRM-System\backend`

#### Option C: PM2 (Recommended)
```bash
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'attendance-absent-check',
    script: 'node',
    args: ['-e', 'import("./src/services/admin/attendance.service.js").then(m => { const s = new m.default(); s.checkAbsentEmployees().then(console.log); });'],
    cron_restart: '0 9,11,13,15,17 * * 1-5',
    autorestart: false,
    watch: false
  }, {
    name: 'attendance-end-of-day',
    script: 'node',
    args: ['-e', 'import("./src/services/admin/attendance.service.js").then(m => { const s = new m.default(); s.processEndOfDayAttendance().then(console.log); });'],
    cron_restart: '0 23 * * 1-5',
    autorestart: false,
    watch: false
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📈 Monitoring & Logs

### View Attendance Logs
```bash
# Check application logs
tail -f logs/combined.log | grep attendance

# Check specific automation logs
grep "Auto-marked" logs/combined.log
grep "half-day" logs/combined.log
```

### Audit Trail
All automated actions are logged in the `audit_logs` table:
- `attendance_auto_absent`: Employee marked absent
- `attendance_auto_incomplete`: Employee marked incomplete
- `attendance_clock_in`: Manual clock-in with late detection
- `attendance_clock_out`: Manual clock-out with half-day detection

## 🔧 Configuration

### Shift Settings (affects automation)
- `fullDayHours`: Minimum hours for full day (default: 8.00)
- `halfDayHours`: Minimum hours for half day (default: 4.00)
- `gracePeriodMinutes`: Late arrival buffer (default: 10)
- `shiftStartTime`: When shift begins
- `shiftEndTime`: When shift ends

### Working Rules
- `workingDays`: Days when employees should work [1,2,3,4,5]
- `weekendDays`: Days when employees are off [0,6]

## 🚨 Troubleshooting

### Common Issues

1. **Migration fails**
   ```bash
   # Check if column already exists
   node -e "
   import('./src/config/sequelize.js').then(seq => {
     seq.default.query('DESCRIBE attendance_records').then(console.log);
   });"
   ```

2. **Notifications not sending**
   - Check SSE connection in browser dev tools
   - Verify notification service is running
   - Check user roles and permissions

3. **Absent detection not working**
   - Verify employees have active shifts assigned
   - Check if working rules are configured
   - Ensure cron jobs are running

4. **Half-day detection incorrect**
   - Verify shift `fullDayHours` and `halfDayHours` settings
   - Check if break time is being calculated correctly
   - Ensure clock-out triggers the calculation

### Debug Commands
```bash
# Test absent detection manually
node -e "
import('./src/services/admin/attendance.service.js').then(m => {
  const service = new m.default();
  service.checkAbsentEmployees().then(result => {
    console.log('Absent check result:', JSON.stringify(result, null, 2));
  });
});"

# Test end-of-day processing
node -e "
import('./src/services/admin/attendance.service.js').then(m => {
  const service = new m.default();
  service.processEndOfDayAttendance().then(result => {
    console.log('End-of-day result:', JSON.stringify(result, null, 2));
  });
});"
```

## 📋 Summary

The enhanced attendance system now provides:

✅ **Automatic absent marking** when employees don't clock in  
✅ **Smart half-day detection** based on worked hours  
✅ **Half-day type classification** (first half vs second half)  
✅ **Real-time notifications** for all attendance events  
✅ **Comprehensive audit logging** for compliance  
✅ **Flexible scheduling** with multiple automation options  

This ensures accurate attendance tracking with minimal manual intervention while maintaining full transparency through notifications and audit trails.