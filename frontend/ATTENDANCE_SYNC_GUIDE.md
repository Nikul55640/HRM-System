# Attendance Clock In/Out Synchronization Guide

## Overview
The clock in/out functionality is now synchronized across all components using a shared Zustand store (`useAttendanceSessionStore`). When a user clocks in from any component, the state updates globally and reflects in all other components.

## Architecture

### Shared State Management
**Store:** `src/stores/useAttendanceSessionStore.js`

The store manages:
- `todayRecord` - Today's attendance record with sessions
- `isLoading` - Loading state for async operations
- `lastUpdated` - Timestamp of last update
- `error` - Error messages

### Key Methods

#### 1. **fetchTodayRecord(silent = false)**
- Fetches today's attendance record from the backend
- `silent = true` → No loading spinner (background refresh)
- `silent = false` → Shows loading state
- Called every 30 seconds for auto-sync

#### 2. **clockIn(locationData)**
- Starts a new attendance session
- Accepts: `{ workLocation, locationDetails, notes }`
- Returns: `{ success, data/error }`
- Auto-refreshes store after success

#### 3. **clockOut()**
- Ends the current session
- Handles both new session format and legacy clock-in
- Auto-refreshes store after success

#### 4. **getAttendanceStatus()**
- Derived state (computed on-the-fly)
- Returns:
  ```javascript
  {
    isClockedIn: boolean,
    isOnBreak: boolean,
    hasLegacyClockIn: boolean,
    activeSession: object | null,
    hasCompletedSessions: boolean,
    todayRecord: object | null
  }
  ```

## Components Using the Store

### 1. **EmployeeDashboard** (`src/modules/employee/pages/Dashboard/EmployeeDashboard.jsx`)
- Initializes store on mount with `fetchTodayRecord()`
- Auto-refreshes every 30 seconds
- Shows clock in/out button with real-time status
- Displays today's activities from `todayRecord`

### 2. **EnhancedClockInOut** (`src/modules/attendance/employee/EnhancedClockInOut.jsx`)
- Uses same store for clock in/out actions
- Shows active session details
- Displays break management buttons
- Shows completed sessions count

## Synchronization Flow

```
User clicks "Clock In" in EmployeeDashboard
    ↓
clockIn() called → API request to backend
    ↓
Backend processes and returns success
    ↓
fetchTodayRecord(true) called (silent refresh)
    ↓
Store updates todayRecord
    ↓
All components using the store re-render with new data
    ↓
EnhancedClockInOut shows updated status
    ↓
EmployeeDashboard shows updated activities
```

## Real-Time Updates

### Auto-Refresh Mechanism
- **Every 30 seconds:** Silent refresh of attendance data
- **On action:** Immediate refresh after clock in/out/break actions
- **No polling delays:** Data stays fresh without user intervention

### Component Re-renders
- Zustand automatically triggers re-renders when store state changes
- Only components using the store are affected
- Efficient updates (no unnecessary re-renders)

## Usage Example

```javascript
import useAttendanceSessionStore from 'stores/useAttendanceSessionStore';

function MyComponent() {
  const {
    todayRecord,
    isLoading,
    clockIn,
    clockOut,
    getAttendanceStatus,
    fetchTodayRecord
  } = useAttendanceSessionStore();

  // Get current status
  const { isClockedIn, isOnBreak, activeSession } = getAttendanceStatus();

  // Clock in
  const handleClockIn = async () => {
    const result = await clockIn({
      workLocation: 'office',
      locationDetails: 'Office',
      notes: 'Clocked in'
    });
    
    if (result.success) {
      // Store automatically updated, component re-renders
      console.log('Clocked in successfully');
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    await fetchTodayRecord(false); // Show loading
  };

  return (
    <div>
      <p>Status: {isClockedIn ? 'Clocked In' : 'Clocked Out'}</p>
      <button onClick={handleClockIn} disabled={isLoading}>
        Clock In
      </button>
    </div>
  );
}
```

## Data Flow

### Session Format (New)
```javascript
{
  date: "2025-12-25",
  sessions: [
    {
      id: "session-1",
      checkIn: "2025-12-25T09:00:00Z",
      checkOut: "2025-12-25T17:30:00Z",
      status: "completed",
      workLocation: "office",
      locationDetails: "Office",
      breaks: [
        {
          startTime: "2025-12-25T12:00:00Z",
          endTime: "2025-12-25T13:00:00Z"
        }
      ],
      workedMinutes: 480,
      totalBreakMinutes: 60
    }
  ]
}
```

### Legacy Format (Deprecated)
```javascript
{
  date: "2025-12-25",
  checkIn: "2025-12-25T09:00:00Z",
  checkOut: "2025-12-25T17:30:00Z"
}
```

## Troubleshooting

### Clock In Not Showing in Other Components
1. Check if `fetchTodayRecord()` is called on component mount
2. Verify store is imported correctly
3. Check browser console for API errors
4. Ensure backend endpoint `/employee/attendance/session/start` is working

### Data Not Updating
1. Check if `getAttendanceStatus()` is being called
2. Verify `todayRecord` is not null
3. Check if auto-refresh timer is running (30 seconds)
4. Look for API errors in network tab

### Stale Data
1. Manual refresh: Call `fetchTodayRecord(false)`
2. Auto-refresh runs every 30 seconds
3. Refresh on every action (clock in/out/break)

## Best Practices

✅ **DO:**
- Use `getAttendanceStatus()` for derived state
- Call `fetchTodayRecord()` on component mount
- Use silent refresh (`true`) for background updates
- Handle loading states with `isLoading`

❌ **DON'T:**
- Directly access `todayRecord` for status checks
- Skip error handling in async operations
- Create multiple store instances
- Manually update store state (use provided methods)

## API Endpoints Used

| Action | Endpoint | Method |
|--------|----------|--------|
| Fetch Today | `/employee/attendance` | GET |
| Clock In | `/employee/attendance/session/start` | POST |
| Clock Out | `/employee/attendance/session/end` | POST |
| Legacy Clock Out | `/employee/attendance/check-out` | POST |
| Start Break | `/employee/attendance/break/start` | POST |
| End Break | `/employee/attendance/break/end` | POST |

## Testing Checklist

- [ ] Clock in from EmployeeDashboard
- [ ] Verify status updates in EnhancedClockInOut
- [ ] Clock out and verify both components update
- [ ] Start break and verify status changes
- [ ] End break and verify status changes
- [ ] Refresh page and verify data persists
- [ ] Check auto-refresh every 30 seconds
- [ ] Verify error handling for failed requests
- [ ] Test with legacy clock-in data
- [ ] Verify loading states during operations
