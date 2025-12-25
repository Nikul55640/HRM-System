# API Endpoint Mismatch - Frontend vs Backend

## Issues Found

### 1. Attendance Endpoints Mismatch

**Frontend Calling (WRONG):**
- `POST /employee/attendance/session/start` ❌
- `POST /employee/attendance/session/end` ❌
- `POST /employee/attendance/break/start` ❌
- `POST /employee/attendance/break/end` ❌
- `GET /employee/attendance/summary` ❌
- `GET /employee/attendance/sessions` ❌

**Backend Actual Endpoints (CORRECT):**
- `POST /employee/attendance/clock-in` ✅
- `POST /employee/attendance/clock-out` ✅
- `POST /employee/attendance/break-in` ✅
- `POST /employee/attendance/break-out` ✅
- `GET /employee/attendance/summary/:year/:month` ✅
- `GET /employee/attendance` ✅ (returns list with today's record)
- `GET /employee/attendance/today` ✅ (returns today's record)

### 2. Leave Endpoints Issues

**Frontend Calling (WRONG):**
- `GET /employee/leave-balance` (without employee ID) ❌
- `GET /employee/leave-requests` (without proper params) ❌

**Backend Actual Endpoints (CORRECT):**
- `GET /employee/leave-balance` ✅ (returns current user's balance)
- `GET /employee/leave-history` ✅ (returns leave history)
- `GET /employee/leave-requests` ✅ (returns current user's requests)

**Issue:** Backend returns 400 "You can only view your own leave balances" - This suggests the backend is checking for an employee ID parameter that shouldn't be there.

## Files to Fix

### Frontend Files:

1. **useAttendanceSessionStore.js** - Update API endpoints
2. **employeeSelfService.js** - Update leave endpoints
3. **attendanceService.js** - Update attendance endpoints
4. **leaveService.js** - Update leave endpoints

## Fixes Required

### Fix 1: useAttendanceSessionStore.js

```javascript
// BEFORE (WRONG)
const response = await api.post('/employee/attendance/session/start', locationData);
const response = await api.post('/employee/attendance/session/end');
const response = await api.post('/employee/attendance/break/start');
const response = await api.post('/employee/attendance/break/end');

// AFTER (CORRECT)
const response = await api.post('/employee/attendance/clock-in', locationData);
const response = await api.post('/employee/attendance/clock-out');
const response = await api.post('/employee/attendance/break-in');
const response = await api.post('/employee/attendance/break-out');
```

### Fix 2: employeeSelfService.js

```javascript
// BEFORE (WRONG)
const response = await api.get('/employee/attendance/summary', { params: { month, year } });
const response = await api.get('/employee/attendance/sessions', { params: { startDate, endDate } });

// AFTER (CORRECT)
const response = await api.get(`/employee/attendance/summary/${year}/${month}`);
const response = await api.get('/employee/attendance', { params: { startDate, endDate } });
```

### Fix 3: Leave Balance Issue

The backend error "You can only view your own leave balances" suggests the backend is checking for an employee ID in the request. This might be:
- A query parameter being sent incorrectly
- The backend middleware checking for employee ID when it shouldn't

**Solution:** Check if employeeSelfService.js is sending an employee ID parameter that shouldn't be there.

## Testing Checklist

After fixes:
- [ ] Clock in works (POST /employee/attendance/clock-in)
- [ ] Clock out works (POST /employee/attendance/clock-out)
- [ ] Start break works (POST /employee/attendance/break-in)
- [ ] End break works (POST /employee/attendance/break-out)
- [ ] Get today's attendance (GET /employee/attendance/today)
- [ ] Get attendance summary (GET /employee/attendance/summary/2025/12)
- [ ] Get leave balance (GET /employee/leave-balance)
- [ ] Get leave history (GET /employee/leave-history)
- [ ] Get leave requests (GET /employee/leave-requests)

## Backend Endpoint Reference

### Attendance Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/employee/attendance` | Get all attendance records |
| GET | `/employee/attendance/today` | Get today's attendance |
| GET | `/employee/attendance/status` | Get attendance status |
| GET | `/employee/attendance/summary/:year/:month` | Get monthly summary |
| GET | `/employee/attendance/working-hours` | Get working hours |
| POST | `/employee/attendance/clock-in` | Clock in |
| POST | `/employee/attendance/clock-out` | Clock out |
| POST | `/employee/attendance/break-in` | Start break |
| POST | `/employee/attendance/break-out` | End break |
| POST | `/employee/attendance/correction/:attendanceId` | Request correction |

### Leave Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/employee/leave-balance` | Get leave balance |
| GET | `/employee/leave-history` | Get leave history |
| GET | `/employee/leave-balance/history` | Get balance history |
| POST | `/employee/leave-requests` | Create leave request |
| GET | `/employee/leave-requests` | Get leave requests |
| GET | `/employee/leave-requests/:id` | Get specific request |
| DELETE | `/employee/leave-requests/:id` | Cancel request |
| GET | `/employee/eligibility` | Check eligibility |
| GET | `/employee/pending` | Get pending requests |

## Priority Fixes

1. **HIGH** - Fix attendance endpoints in useAttendanceSessionStore.js
2. **HIGH** - Fix leave balance endpoint issue
3. **MEDIUM** - Update employeeSelfService.js endpoints
4. **MEDIUM** - Update attendanceService.js endpoints
