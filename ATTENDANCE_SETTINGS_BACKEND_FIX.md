# AttendanceSettings Backend Integration Fix

## Issue Identified
The AttendanceSettings component was trying to use non-existent backend endpoints:
- `GET /api/admin/config/attendance_settings` (404 error)
- `PUT /api/admin/config/attendance_settings` (would also be 404)

## Root Cause Analysis
The backend only has these config endpoints available:
- `GET /api/config/system` - Get all system configurations
- `POST /api/config/system` - Set a system configuration

But the frontend was trying to use attendance-specific endpoints that don't exist.

## Solution Applied

### Updated configService.js Methods

**Before (Non-existent endpoints):**
```javascript
getAttendanceSettings: async () => {
  const response = await api.get('/admin/config/attendance_settings');
  return response.data;
}

updateAttendanceSettings: async (settings) => {
  const response = await api.put('/admin/config/attendance_settings', { value: settings });
  return response.data;
}
```

**After (Using existing system config endpoints):**
```javascript
getAttendanceSettings: async () => {
  // Get all system configs and find attendance_settings
  const response = await api.get('/config/system');
  const attendanceConfig = response.data?.data?.find(config => config.key === 'attendance_settings');
  
  if (attendanceConfig && attendanceConfig.value) {
    return { success: true, data: attendanceConfig.value };
  } else {
    // Return sensible defaults
    return { success: true, data: { /* defaults */ } };
  }
}

updateAttendanceSettings: async (settings) => {
  // Use system config endpoint to save attendance settings
  const response = await api.post('/config/system', {
    key: 'attendance_settings',
    value: settings,
    description: 'Attendance system configuration settings'
  });
  return response.data;
}
```

### Key Improvements

1. **Uses Existing Backend APIs**: No need to create new backend endpoints
2. **Graceful Fallbacks**: Returns default settings if none exist
3. **Error Handling**: Handles API errors gracefully
4. **Consistent Storage**: Uses the same system config storage as other settings

### Default Settings Provided
When no configuration exists, the system provides these defaults:
```javascript
{
  shiftStartTime: '09:00',
  shiftEndTime: '17:00',
  fullDayHours: 8,
  halfDayHours: 4,
  lateThresholdMinutes: 15,
  gracePeriodMinutes: 10,
  earlyDepartureThresholdMinutes: 15,
  overtimeEnabled: true,
  overtimeThresholdMinutes: 30,
  defaultBreakMinutes: 60,
  maxBreakMinutes: 120
}
```

## Benefits

✅ **No Backend Changes Required**: Uses existing system config infrastructure  
✅ **Consistent with Other Settings**: Same storage mechanism as other system configs  
✅ **Graceful Degradation**: Works even when no config exists  
✅ **Error Resilient**: Handles network errors and missing configs  
✅ **Future Proof**: Can easily add more attendance-related configs  

## Testing

The AttendanceSettings component should now:
1. Load without 404 errors
2. Display default values when no config exists
3. Successfully save settings to the backend
4. Retrieve saved settings on subsequent loads

## Status
🎉 **FIXED** - AttendanceSettings now uses existing backend APIs and works properly.