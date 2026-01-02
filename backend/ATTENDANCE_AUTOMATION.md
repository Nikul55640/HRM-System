-.# Attendance Automation Guide

This document explains the automated attendance processing features in the HRM system.

## Features

### 1. Shift-Based Attendance Validation

The system now automatically validates attendance based on employee shift timings:

- **Late Arrival Detection**: Automatically marks employees as late if they clock in after their shift start time + grace period
- **Real-time Status**: Shows late status immediately upon clock-in
- **Shift Information Display**: Shows expected vs actual clock-in times

### 2. Break Time Tracking

Enhanced break functionality with detailed tracking:

- **Current Break Status**: Shows when a break started and duration
- **Break History**: Displays all breaks taken during the day
- **Break Duration**: Calculates and displays total break time

### 3. Automated Absence Management

Two automated processes handle attendance compliance:

#### End-of-Day Processing
- Runs at the end of each day (recommended: 11 PM)
- Marks employees as "incomplete" if they clocked in but forgot to clock out
- Triggers 2 hours after shift end time

#### Absent Employee Detection
- Runs periodically during the day (recommended: every 2 hours)
- Marks employees as "absent" if they don't clock in
- Triggers 2 hours after shift start time + grace period

## Setup Instructions

### 1. Manual API Endpoints

For testing or manual execution:

```bash
# Process end-of-day attendance
POST /api/admin/attendance/process-end-of-day

# Check for absent employees  
POST /api/admin/attendance/check-absent
```

### 2. Automated Scheduling (Recommended).

#### Using Cron Jobs (Linux/Mac)

Edit your crontab:
```bash
crontab -e
```

Add these lines:
```bash
# Check for absent employees every 2 hours during work day (9 AM to 6 PM)
0 9,11,13,15,17 * * 1-5 cd /path/to/HRM-System/backend && node scripts/attendance-scheduler.js check-absent

# Process end-of-day at 11 PM every weekday
0 23 * * 1-5 cd /path/to/HRM-System/backend && node scripts/attendance-scheduler.js end-of-day
```

#### Using Windows Task Scheduler

1. OpeScheduler
2. Create Basic Task
3. Set trigger for daily/weekly
4. Set action to run: `node scripts/attendance-scheduler.js end-of-day`
5. Set start in: `C:\path\to\HRM-System\backend`

### 3. Using PM2 (Node.js Process Manager)

For more robust scheduling:

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'attendance-end-of-day',
    script: 'scripts/attendance-scheduler.js',
    args: 'end-of-day',
    cron_restart: '0 23 * * 1-5',
    autorestart: false
  }, {
    name: 'attendance-check-absent',
    script: 'scripts/attendance-scheduler.js', 
    args: 'check-absent',
    cron_restart: '0 9,11,13,15,17 * * 1-5',
    autorestart: false
  }]
};

# Start with PM2
pm2 start ecosystem.config.js
```

## Configuration

### Shift Settings

Configure these in your shift management:

- **Grace Period**: Minutes after shift start time before marking late
- **Early Departure Threshold**: Minutes before shift end time to mark early departure
- **Overtime Threshold**: Minutes after shift end time to start counting overtime

### Automation Timing

Default timing can be adjusted in the service:

- **Absent Check**: 2 hours after shift start + grace period
- **Incomplete Check**: 2 hours after shift end time

## Monitoring

### Logs

All automated actions are logged:

- Check application logs for execution status
- Audit logs track all automated attendance changes
- Each action includes employee details and reason

### Notifications

Consider adding email/SMS notifications for:

- Employees marked as absent
- Employees with incomplete attendance
- Daily attendance summary for HR

## Troubleshooting

### Common Issues

1. **Script not running**: Check file permissions and Node.js path
2. **Database connection**: Ensure database is accessible from cron environment
3. **Timezone issues**: Verify server timezone matches business timezone

### Testing

Test the automation manually:

```bash
# Test absent employee check
node scripts/attendance-scheduler.js check-absent

# Test end-of-day processing
node scripts/attendance-scheduler.js end-of-day
```

## Security Considerations

- Automated processes run with system user (ID: 1)
- All actions are audited and logged
- Only SuperAdmin can trigger manual processing via API
- Cron jobs should run with appropriate user permissions

## Future Enhancements

Potential improvements:

1. **Email Notifications**: Notify employees and HR of attendance issues
2. **Flexible Timing**: Configure automation timing per shift
3. **Holiday Handling**: Skip processing on company holidays
4. **Geofencing**: Validate location-based attendance
5. **Mobile Notifications**: Push notifications for attendance reminders