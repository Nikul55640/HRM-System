# Attendance System Improvement - Multiple Clock In/Out Sessions

## Current Limitation
- Only supports ONE check-in and ONE check-out per day
- Doesn't track breaks (lunch, tea breaks, etc.)
- Can't handle employees leaving and returning

## Proposed Solution: Session-Based Attendance

### Updated Model Structure
```javascript
{
  employeeId: ObjectId,
  date: Date,
  sessions: [
    {
      checkIn: Date,
      checkOut: Date,
      type: 'work' | 'break',  // work session or break
      duration: Number,  // minutes
      location: { lat, lng }
    }
  ],
  totalWorkMinutes: Number,  // Sum of all work sessions
  totalBreakMinutes: Number,  // Sum of all breaks
  workHours: Number,  // Calculated from totalWorkMinutes
  status: 'present' | 'absent' | 'half_day',
  // ... other fields
}
```

### How It Works

#### Scenario 1: Normal Day with Lunch Break
1. **9:00 AM** - Clock In (Session 1 starts)
2. **1:00 PM** - Clock Out for Lunch (Session 1 ends - 4 hours)
3. **2:00 PM** - Clock In from Lunch (Session 2 starts)
4. **6:00 PM** - Clock Out (Session 2 ends - 4 hours)
- **Total Work**: 8 hours
- **Break Time**: 1 hour (automatically calculated)

#### Scenario 2: Multiple Breaks
1. **9:00 AM** - Clock In
2. **11:00 AM** - Clock Out (Tea break)
3. **11:15 AM** - Clock In
4. **1:00 PM** - Clock Out (Lunch)
5. **2:00 PM** - Clock In
6. **4:00 PM** - Clock Out (Tea break)
7. **4:15 PM** - Clock In
8. **6:00 PM** - Clock Out
- **Total Work**: ~7.5 hours
- **Break Time**: ~1.5 hours

### Frontend Changes

#### Current State Button
- Shows current session status
- "Clock In" if no active session
- "Clock Out" if currently clocked in
- Shows total work time for the day

#### Session History (Today)
```
Session 1: 9:00 AM - 1:00 PM (4h 0m) ✓
Break:     1:00 PM - 2:00 PM (1h 0m)
Session 2: 2:00 PM - 6:00 PM (4h 0m) ✓
---
Total Work: 8h 0m
Total Break: 1h 0m
```

### Benefits
1. ✅ Accurate time tracking
2. ✅ Supports flexible work schedules
3. ✅ Tracks break time automatically
4. ✅ Better for payroll calculations
5. ✅ Complies with labor laws (break tracking)

### Implementation Steps
1. Update AttendanceRecord model to include sessions array
2. Update backend controller to handle session-based clock in/out
3. Update frontend to show multiple sessions
4. Add session timeline visualization
5. Calculate total work time from all sessions

### API Changes

#### Clock In
```javascript
POST /api/employee/attendance/clock-in
Response: {
  success: true,
  data: {
    currentSession: { checkIn: "2025-12-04T09:00:00Z" },
    todaySessions: [...],
    totalWorkMinutes: 0
  }
}
```

#### Clock Out
```javascript
POST /api/employee/attendance/clock-out
Response: {
  success: true,
  data: {
    completedSession: { checkIn: "...", checkOut: "...", duration: 240 },
    todaySessions: [...],
    totalWorkMinutes: 240
  }
}
```

### Migration Strategy
- Keep existing checkIn/checkOut fields for backward compatibility
- Add sessions array as new field
- Gradually migrate to session-based system
- Old records: checkIn/checkOut → converted to single session
- New records: Use sessions array

## Next Steps
1. Update model schema
2. Update controllers
3. Update frontend UI
4. Test with multiple sessions
5. Deploy and monitor
