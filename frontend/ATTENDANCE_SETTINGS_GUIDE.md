# Attendance Settings Configuration Guide

## Overview

The **Attendance Settings** page allows Admin/HR to configure all attendance rules and thresholds that apply system-wide.

## Access

**URL:** `/admin/attendance-settings`

**Roles:** SuperAdmin, Admin, HR

## Settings Categories

### 1. Shift Timings ⏰

Configure the standard work shift hours.

#### Settings:
- **Shift Start Time** (default: 09:00)
  - When employees should clock in
  - Example: 09:00 AM

- **Shift End Time** (default: 17:00)
  - When shift officially ends
  - Example: 05:00 PM

#### How It Works:
```
Shift: 09:00 AM ──────────────► 05:00 PM
       (8 hours standard shift)
```

---

### 2. Work Hours Thresholds 📊

Define minimum hours for attendance status.

#### Settings:
- **Full Day Hours** (default: 8)
  - Minimum hours to mark as "Present"
  - Example: 8 hours = Full day

- **Half Day Hours** (default: 4)
  - Minimum hours to mark as "Half Day"
  - Example: 4-7.9 hours = Half day

#### Status Logic:
```
Work Hours          Status
─────────────────────────────
≥ 8 hours      →   Present ✓
4-7.9 hours    →   Half Day ⚠️
< 4 hours      →   Absent ❌
```

---

### 3. Late Arrival & Early Departure ⏱️

Configure grace periods and late thresholds.

#### Settings:
- **Grace Period** (default: 10 minutes)
  - Allowed delay without marking as late
  - Example: Clock in by 09:10 AM = On time

- **Late Threshold** (default: 15 minutes)
  - Minutes late to mark as "Late"
  - Example: Clock in after 09:15 AM = Late

- **Early Departure Threshold** (default: 15 minutes)
  - Minutes early to mark as early departure
  - Example: Clock out before 04:45 PM = Early

#### Example Scenario:

**Shift Start: 09:00 AM**
**Grace Period: 10 minutes**

```
Clock In Time          Status
─────────────────────────────────
08:50 AM          →   On Time ✓
09:00 AM          →   On Time ✓
09:05 AM          →   On Time ✓ (within grace)
09:10 AM          →   On Time ✓ (grace limit)
09:11 AM          →   Late ⚠️
09:20 AM          →   Late ⚠️ (20 min late)
```

---

### 4. Overtime Settings 💼

Configure overtime tracking and calculation.

#### Settings:
- **Enable Overtime Tracking** (default: Yes)
  - Toggle overtime calculation on/off

- **Overtime Threshold** (default: 30 minutes)
  - Minimum minutes after shift to count as overtime
  - Example: Clock out after 05:30 PM = Overtime

#### How It Works:
```
Shift End: 05:00 PM

Clock Out Time         Overtime
────────────────────────────────
05:00 PM          →   0 minutes
05:15 PM          →   0 minutes (below threshold)
05:30 PM          →   0 minutes (at threshold)
05:31 PM          →   31 minutes ✓
06:00 PM          →   60 minutes ✓
```

---

### 5. Break Time Settings ☕

Configure break duration limits.

#### Settings:
- **Default Break Duration** (default: 60 minutes)
  - Standard lunch/break time
  - Used for calculations

- **Maximum Break Duration** (default: 120 minutes)
  - Maximum allowed break per day
  - Prevents excessive breaks

#### Example:
```
Session 1: 09:00 AM - 01:00 PM (4 hours)
Break:     01:00 PM - 02:00 PM (1 hour) ✓
Session 2: 02:00 PM - 06:00 PM (4 hours)

Total Work: 8 hours
Total Break: 1 hour (within limit)
```

---

## Complete Example Configuration

### Scenario: Standard Office Hours

```yaml
Shift Timings:
  Start: 09:00 AM
  End: 05:00 PM

Work Hours:
  Full Day: 8 hours
  Half Day: 4 hours

Late Rules:
  Grace Period: 10 minutes
  Late Threshold: 15 minutes
  Early Departure: 15 minutes

Overtime:
  Enabled: Yes
  Threshold: 30 minutes

Breaks:
  Default: 60 minutes (lunch)
  Maximum: 120 minutes
```

### How This Works:

#### Employee A - Perfect Day ✓
```
09:00 AM - Clock In (On time)
01:00 PM - Clock Out (Lunch)
02:00 PM - Clock In (Back from lunch)
05:00 PM - Clock Out (End of shift)

Result:
- Work Time: 8 hours
- Break Time: 1 hour
- Status: Present ✓
- Late: No
- Overtime: No
```

#### Employee B - Late Arrival ⚠️
```
09:20 AM - Clock In (20 min late)
01:00 PM - Clock Out (Lunch)
02:00 PM - Clock In
05:00 PM - Clock Out

Result:
- Work Time: 7h 40m
- Break Time: 1 hour
- Status: Half Day ⚠️
- Late: Yes (20 minutes)
- Overtime: No
```

#### Employee C - Overtime 💼
```
09:00 AM - Clock In
01:00 PM - Clock Out
02:00 PM - Clock In
06:30 PM - Clock Out (1.5h overtime)

Result:
- Work Time: 9.5 hours
- Break Time: 1 hour
- Status: Present ✓
- Late: No
- Overtime: Yes (90 minutes)
```

---

## Backend Integration

### Config Storage

Settings are stored in the `Config` collection:

```javascript
{
  key: "attendance_settings",
  value: {
    shiftStartTime: "09:00",
    shiftEndTime: "17:00",
    fullDayHours: 8,
    halfDayHours: 4,
    lateThresholdMinutes: 15,
    gracePeriodMinutes: 10,
    // ... other settings
  },
  category: "system",
  updatedBy: ObjectId("..."),
  updatedAt: Date
}
```

### Attendance Calculation

When employee clocks in/out, the backend:

1. **Fetches attendance settings** from Config
2. **Calculates work hours** from clock in/out times
3. **Applies grace period** for late detection
4. **Determines status** based on work hours
5. **Calculates overtime** if applicable
6. **Saves attendance record** with all calculations

### API Endpoints

```javascript
// Get settings
GET /api/config/attendance_settings

// Update settings (Admin/HR only)
PUT /api/config/attendance_settings
Body: { ...settings }
```

---

## Usage Instructions

### For Admin/HR:

1. **Navigate to Settings**
   - Go to Admin Dashboard
   - Click "Attendance Settings"

2. **Configure Shift Timings**
   - Set shift start time (e.g., 09:00)
   - Set shift end time (e.g., 17:00)

3. **Set Work Hour Thresholds**
   - Full day hours (e.g., 8)
   - Half day hours (e.g., 4)

4. **Configure Late Rules**
   - Grace period (e.g., 10 minutes)
   - Late threshold (e.g., 15 minutes)
   - Early departure threshold (e.g., 15 minutes)

5. **Setup Overtime**
   - Enable/disable overtime tracking
   - Set overtime threshold (e.g., 30 minutes)

6. **Set Break Limits**
   - Default break duration (e.g., 60 minutes)
   - Maximum break duration (e.g., 120 minutes)

7. **Save Settings**
   - Click "Save Settings" button
   - Settings apply immediately

### For Employees:

Settings are **automatically applied** when:
- Clocking in/out
- Viewing attendance records
- Checking attendance status

Employees don't need to do anything - the system uses these settings automatically!

---

## Benefits

### 1. Centralized Configuration ✓
- All attendance rules in one place
- Easy to update
- Consistent across system

### 2. Flexible Rules ✓
- Adjust to company policy
- Different grace periods
- Custom work hour thresholds

### 3. Automatic Calculations ✓
- No manual status updates
- Accurate overtime tracking
- Fair late detection

### 4. Compliance ✓
- Track break times
- Monitor work hours
- Labor law compliance

### 5. Transparency ✓
- Clear rules for everyone
- Consistent application
- No favoritism

---

## Best Practices

### 1. Set Reasonable Grace Periods
- **Recommended:** 5-15 minutes
- Too short: Unfair to employees
- Too long: Encourages lateness

### 2. Define Clear Work Hours
- **Full Day:** 8 hours (standard)
- **Half Day:** 4 hours (minimum)
- Align with company policy

### 3. Configure Overtime Properly
- **Threshold:** 30-60 minutes
- Prevents accidental overtime
- Ensures intentional overtime is tracked

### 4. Set Break Limits
- **Default:** 60 minutes (lunch)
- **Maximum:** 90-120 minutes
- Prevents excessive breaks

### 5. Communicate Changes
- Notify employees of new settings
- Explain grace periods
- Clarify overtime rules

---

## Troubleshooting

### Issue: Employees marked late unfairly
**Solution:** Increase grace period (e.g., from 5 to 10 minutes)

### Issue: Too many half-day marks
**Solution:** Reduce half-day threshold (e.g., from 6 to 4 hours)

### Issue: Overtime not tracking
**Solution:** 
- Enable overtime tracking
- Reduce overtime threshold
- Check shift end time

### Issue: Break time too restrictive
**Solution:** Increase maximum break duration

---

## Summary

The Attendance Settings page provides complete control over:
- ✅ Shift timings
- ✅ Work hour thresholds
- ✅ Late/early rules
- ✅ Overtime calculation
- ✅ Break time limits

All settings apply system-wide and take effect immediately!

**Access:** `/admin/attendance-settings`
**Roles:** SuperAdmin, Admin, HR
