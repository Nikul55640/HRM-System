# Enhanced Attendance System Design

## Overview

The Enhanced Attendance System extends the existing single-session attendance tracking to support multiple daily work sessions, break tracking, work location selection, IP verification, and real-time monitoring. The system maintains backward compatibility with existing attendance records while adding new capabilities through schema extensions and new API endpoints.

The design leverages the existing MongoDB-based AttendanceRecord model and extends it with a sessions array to support multiple check-ins per day. Each session can contain multiple breaks, work location information, and IP tracking data. The frontend will be enhanced with a modal-based location selection interface and real-time update capabilities.

## Architecture

### System Components

1. **Backend Data Layer**
   - Extended AttendanceRecord model with sessions array
   - Session sub-schema with breaks array
   - IP encryption utilities
   - Real-time event emitters

2. **Backend API Layer**
   - New session management endpoints
   - Break tracking endpoints
   - Live attendance query endpoints
   - Notification service integration

3. **Frontend Presentation Layer**
   - Enhanced ClockInOut component with location modal
   - Live attendance dashboard for HR
   - Session and break history views
   - IP detection service

4. **Real-time Communication**
   - WebSocket or polling mechanism for live updates
   - Event-driven notification system

### Data Flow

```
Employee Action → Frontend Component → API Endpoint → Model Validation → Database Update → Event Emission → Real-time Update → HR Dashboard
```


## Components and Interfaces

### Backend Components

#### 1. AttendanceRecord Model Extension

```javascript
// New fields added to existing schema
{
  // Existing fields remain unchanged
  
  // New: Multiple sessions support
  sessions: [{
    sessionId: String,
    checkIn: Date,
    checkOut: Date,
    workLocation: {
      type: String,
      enum: ['office', 'wfh', 'client_site']
    },
    locationDetails: String, // For client site
    ipAddressCheckIn: String, // Encrypted
    ipAddressCheckOut: String, // Encrypted
    breaks: [{
      breakId: String,
      startTime: Date,
      endTime: Date,
      durationMinutes: Number
    }],
    totalBreakMinutes: Number,
    workedMinutes: Number,
    status: String // 'active', 'on_break', 'completed'
  }],
  
  // Backward compatibility: keep existing checkIn/checkOut
  // These will reference the first/last session
}
```

#### 2. API Endpoints

**Session Management**
- `POST /employee/attendance/session/start` - Start new work session
- `POST /employee/attendance/session/end` - End current work session
- `GET /employee/attendance/sessions` - Get all sessions for date range

**Break Management**
- `POST /employee/attendance/break/start` - Start break
- `POST /employee/attendance/break/end` - End break

**Live Monitoring**
- `GET /admin/attendance/live` - Get currently active sessions
- `GET /admin/attendance/live/:employeeId` - Get specific employee status

#### 3. Services

**IP Detection Service**
```javascript
class IPService {
  async captureIP(req)
  async encryptIP(ipAddress)
  async decryptIP(encryptedIP)
}
```

**Notification Service Extension**
```javascript
class NotificationService {
  async notifyHRClockIn(employeeData, sessionData)
  async notifyHRClockOut(employeeData, sessionData)
  async batchNotifications(events)
}
```


### Frontend Components

#### 1. Enhanced ClockInOut Component

```jsx
<ClockInOut>
  <CurrentTimeDisplay />
  <SessionStatusIndicator />
  <LocationSelectionModal />
  <ActionButtons>
    <ClockInButton />
    <ClockOutButton />
    <StartBreakButton />
    <EndBreakButton />
  </ActionButtons>
  <TodaySessionsList />
</ClockInOut>
```

#### 2. Location Selection Modal

```jsx
<LocationModal>
  <RadioGroup>
    <Option value="office">Office</Option>
    <Option value="wfh">Work From Home</Option>
    <Option value="client_site">Client Site</Option>
  </RadioGroup>
  <ConditionalInput show={location === 'client_site'}>
    <TextInput placeholder="Enter client site details" />
  </ConditionalInput>
  <ConfirmButton />
</LocationModal>
```

#### 3. Live Attendance Dashboard (HR)

```jsx
<LiveAttendanceDashboard>
  <FilterBar />
  <AttendanceGrid>
    {employees.map(emp => (
      <EmployeeCard>
        <EmployeeName />
        <CurrentStatus /> {/* Working, On Break, Checked Out */}
        <WorkLocation />
        <SessionStartTime />
        <WorkDuration />
      </EmployeeCard>
    ))}
  </AttendanceGrid>
</LiveAttendanceDashboard>
```

#### 4. Services

**IP Detection Service**
```javascript
class IPDetectionService {
  async getClientIP()
  async getIPInfo(ip)
}
```

**Real-time Service**
```javascript
class RealtimeAttendanceService {
  subscribe(callback)
  unsubscribe()
  pollLiveData()
}
```


## Data Models

### Session Schema

```javascript
{
  sessionId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    default: null
  },
  workLocation: {
    type: String,
    enum: ['office', 'wfh', 'client_site'],
    required: true
  },
  locationDetails: {
    type: String,
    maxlength: 200
  },
  ipAddressCheckIn: {
    type: String, // Encrypted
    required: true
  },
  ipAddressCheckOut: {
    type: String // Encrypted
  },
  breaks: [{
    breakId: String,
    startTime: Date,
    endTime: Date,
    durationMinutes: Number
  }],
  totalBreakMinutes: {
    type: Number,
    default: 0
  },
  workedMinutes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'on_break', 'completed'],
    default: 'active'
  }
}
```

### Break Schema

```javascript
{
  breakId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 0
  }
}
```

### Live Attendance Response Model

```javascript
{
  employeeId: String,
  fullName: String,
  currentSession: {
    sessionId: String,
    checkInTime: Date,
    workLocation: String,
    status: String, // 'working', 'on_break'
    currentBreak: {
      startTime: Date,
      durationMinutes: Number
    },
    totalWorkedMinutes: Number,
    totalBreakMinutes: Number
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Session creation on clock-in
*For any* employee and clock-in request, the system should create a new work session with a start timestamp matching the server time.
**Validates: Requirements 1.1**

### Property 2: Session completion on clock-out
*For any* active work session, clocking out should record an end timestamp and mark the session as completed.
**Validates: Requirements 1.2**

### Property 3: Multiple sessions per day
*For any* employee who has completed a session (clocked out), the system should allow starting a new session on the same date, resulting in multiple sessions for that date.
**Validates: Requirements 1.3**

### Property 4: Duplicate clock-in prevention
*For any* employee with an active session (clocked in but not clocked out), attempting to clock in again should be rejected with an error indicating the current session status.
**Validates: Requirements 1.4**

### Property 5: Session retrieval completeness
*For any* date with multiple sessions, querying attendance records for that date should return all sessions for that employee.
**Validates: Requirements 1.5**

### Property 6: Break availability during active session
*For any* active work session (clocked in, not on break, not clocked out), the start break action should be available.
**Validates: Requirements 2.1**

### Property 7: Break recording and state change
*For any* active work session, starting a break should record the break start timestamp and change the session status to 'on_break'.
**Validates: Requirements 2.2**

### Property 8: End break availability
*For any* work session with an active break (break started but not ended), the end break action should be available.
**Validates: Requirements 2.3**

### Property 9: Break duration calculation
*For any* break with both start and end timestamps, the calculated duration should equal the time difference in minutes.
**Validates: Requirements 2.4**

### Property 10: Break retrieval completeness
*For any* work session containing breaks, querying the session should return all breaks with their complete details (start, end, duration).
**Validates: Requirements 2.5**

### Property 11: Location requirement validation
*For any* clock-in attempt without a work location selection, the system should reject the request with a validation error.
**Validates: Requirements 3.2**

### Property 12: Location storage round-trip
*For any* work location selected during clock-in, retrieving the session should return the same work location value.
**Validates: Requirements 3.3**

### Property 13: Location display completeness
*For any* work session with a stored location, querying the session should include the work location in the response.
**Validates: Requirements 3.4**

### Property 14: Client site details availability
*For any* clock-in with work location set to 'client_site', the system should accept and store additional location details.
**Validates: Requirements 3.5**

### Property 15: IP capture on clock-in
*For any* clock-in action, the system should capture and store an IP address (or mark as unavailable if detection fails).
**Validates: Requirements 4.1**

### Property 16: IP capture on clock-out
*For any* clock-out action, the system should capture and store an IP address (or mark as unavailable if detection fails).
**Validates: Requirements 4.2**

### Property 17: IP retrieval for HR
*For any* session with captured IP addresses, HR queries should return both clock-in and clock-out IP addresses.
**Validates: Requirements 4.3**

### Property 18: IP encryption
*For any* IP address stored in the database, the stored value should be encrypted (not equal to the plaintext IP).
**Validates: Requirements 4.5**

### Property 19: Live attendance query accuracy
*For any* set of employees with active sessions at a given time, the live attendance query should return exactly those employees and no others.
**Validates: Requirements 5.3**

### Property 20: Live attendance data completeness
*For any* employee in the live attendance list, the response should include employee name, clock-in time, work location, and current status.
**Validates: Requirements 5.4**

### Property 21: Break status reflection in live attendance
*For any* employee who starts or ends a break, querying live attendance immediately after should reflect the updated status.
**Validates: Requirements 5.5**

### Property 22: Clock-in notification creation
*For any* employee clock-in action, a notification should be created for HR administrators with the employee name, action type, and timestamp.
**Validates: Requirements 6.1**

### Property 23: Clock-out notification creation
*For any* employee clock-out action, a notification should be created for HR administrators with the employee name, action type, and timestamp.
**Validates: Requirements 6.2**

### Property 24: Notification content completeness
*For any* attendance notification, it should include employee name, action type (clock-in/clock-out), timestamp, and work location.
**Validates: Requirements 6.3**

### Property 25: Notification preference respect
*For any* HR administrator with notification preferences disabled for attendance, no notifications should be sent to that administrator.
**Validates: Requirements 6.4**

### Property 26: Session grouping by date
*For any* set of work sessions across multiple dates, querying attendance history should group sessions by their date correctly.
**Validates: Requirements 7.1**

### Property 27: Session display completeness
*For any* work session in the attendance history, the display should include clock-in time, clock-out time, work location, and total duration.
**Validates: Requirements 7.2**

### Property 28: Break display completeness
*For any* work session containing breaks, each break should be displayed with start time, end time, and duration.
**Validates: Requirements 7.3**

### Property 29: Work time calculation accuracy
*For any* completed work session with breaks, the calculated worked time should equal (clock-out time - clock-in time - total break time).
**Validates: Requirements 7.4**

### Property 30: Attendance history filtering
*For any* date range or work location filter applied to attendance history, only sessions matching the filter criteria should be returned.
**Validates: Requirements 7.5**

### Property 31: Required field validation
*For any* attempt to create an attendance record without required fields (employeeId, date, checkIn, workLocation), the system should reject the request with a validation error.
**Validates: Requirements 8.1**

### Property 32: Server timestamp enforcement
*For any* attendance record created, the timestamps should be generated by the server, not accepted from client input.
**Validates: Requirements 8.2**

### Property 33: Historical record immutability
*For any* past attendance record (date before today), employee attempts to modify the record should be rejected with an authorization error.
**Validates: Requirements 8.3**

### Property 34: Audit trail creation
*For any* attendance record access (read, create, update), an audit log entry should be created with the action, user, and timestamp.
**Validates: Requirements 8.4**

### Property 35: Inconsistency detection
*For any* attendance record with data inconsistencies (e.g., clock-out before clock-in, negative break duration), the system should flag the record for review.
**Validates: Requirements 8.5**


## Error Handling

### Validation Errors

1. **Missing Required Fields**
   - Status Code: 400
   - Message: "Required field missing: {fieldName}"
   - Action: Return validation error with specific field information

2. **Invalid Work Location**
   - Status Code: 400
   - Message: "Invalid work location. Must be one of: office, wfh, client_site"
   - Action: Return validation error with allowed values

3. **Duplicate Clock-In**
   - Status Code: 400
   - Message: "Already clocked in. Current session started at {timestamp}"
   - Action: Return current session information

4. **No Active Session**
   - Status Code: 400
   - Message: "No active session found. Please clock in first."
   - Action: Return error with guidance to clock in

5. **Break State Violation**
   - Status Code: 400
   - Message: "Cannot {action} while on break" or "No active break to end"
   - Action: Return current session state

### Authorization Errors

1. **No Employee Profile**
   - Status Code: 403
   - Message: "Employee profile not linked to your account"
   - Action: Redirect to profile setup or contact HR

2. **Historical Record Modification**
   - Status Code: 403
   - Message: "Cannot modify past attendance records"
   - Action: Return error with date information

3. **Insufficient Permissions**
   - Status Code: 403
   - Message: "Insufficient permissions to access live attendance"
   - Action: Return error with required role information

### System Errors

1. **IP Detection Failure**
   - Status Code: 200 (non-blocking)
   - Action: Record IP as "unavailable" and proceed with clock-in/out
   - Log: Warning level log for monitoring

2. **Encryption Failure**
   - Status Code: 500
   - Message: "Failed to encrypt sensitive data"
   - Action: Abort operation and log error

3. **Database Errors**
   - Status Code: 500
   - Message: "Failed to save attendance record"
   - Action: Return generic error, log detailed error for debugging

4. **Notification Failure**
   - Status Code: 200 (non-blocking)
   - Action: Complete attendance action, log notification failure
   - Retry: Queue notification for retry

### Data Integrity Errors

1. **Timestamp Inconsistency**
   - Detection: Clock-out before clock-in
   - Action: Flag record for review, notify HR
   - Status: Mark as "needs_review"

2. **Negative Duration**
   - Detection: Break or session with negative duration
   - Action: Flag record for review, prevent save
   - Status: Return validation error

3. **Session Overlap**
   - Detection: New session starts before previous ends
   - Action: Auto-close previous session or reject new session
   - Log: Warning level log


## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and error conditions for individual components:

**Backend Unit Tests:**
- Model validation (required fields, enum values, data types)
- Timestamp calculation functions
- Break duration calculation
- IP encryption/decryption functions
- Session state transitions
- Error handling for invalid inputs
- Edge cases: empty sessions array, null values, boundary times

**Frontend Unit Tests:**
- Component rendering with different states
- Button enable/disable logic based on session status
- Location modal display and selection
- Time formatting functions
- Error message display
- Edge cases: no sessions, multiple sessions, active breaks

### Property-Based Testing

Property-based tests will verify universal properties across all valid inputs using **fast-check** for JavaScript/TypeScript. Each property test should run a minimum of 100 iterations.

**Test Configuration:**
```javascript
import fc from 'fast-check';

// Configure to run 100+ iterations
fc.assert(
  fc.property(/* generators */, /* test function */),
  { numRuns: 100 }
);
```

**Property Test Categories:**

1. **Session Management Properties**
   - Session creation always produces valid session with timestamp
   - Clock-out always updates existing session
   - Multiple sessions maintain chronological order
   - Duplicate clock-in always rejected

2. **Break Management Properties**
   - Break duration always equals end - start
   - Total break time equals sum of all break durations
   - Break state transitions follow valid state machine

3. **Data Integrity Properties**
   - Work time calculation: (clock-out - clock-in - breaks) always non-negative
   - Timestamps always use server time
   - IP addresses always encrypted in storage
   - Required fields always present in valid records

4. **Query Properties**
   - Session retrieval returns all sessions for date
   - Live attendance returns only active sessions
   - Filtering returns only matching records
   - Grouping by date maintains all sessions

5. **Round-Trip Properties**
   - Location selection round-trip: store then retrieve equals original
   - Session data round-trip: create then query equals original
   - Encryption round-trip: encrypt then decrypt equals original

**Generator Strategies:**

```javascript
// Smart generators for test data
const employeeIdGen = fc.string({ minLength: 24, maxLength: 24 }); // MongoDB ObjectId
const timestampGen = fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') });
const workLocationGen = fc.constantFrom('office', 'wfh', 'client_site');
const ipAddressGen = fc.ipV4();

// Constrained generators for valid sessions
const validSessionGen = fc.record({
  checkIn: timestampGen,
  checkOut: timestampGen,
  workLocation: workLocationGen
}).filter(s => s.checkOut > s.checkIn); // Ensure valid time range

// Generator for sessions with breaks
const sessionWithBreaksGen = fc.record({
  checkIn: timestampGen,
  checkOut: timestampGen,
  breaks: fc.array(validBreakGen, { minLength: 0, maxLength: 5 })
});
```

**Property Test Tagging:**

Each property-based test must include a comment tag referencing the design document property:

```javascript
// **Feature: enhanced-attendance-system, Property 1: Session creation on clock-in**
test('clock-in creates session with server timestamp', () => {
  fc.assert(
    fc.property(employeeIdGen, workLocationGen, (employeeId, location) => {
      const session = clockIn(employeeId, location);
      expect(session).toBeDefined();
      expect(session.checkIn).toBeInstanceOf(Date);
      expect(session.workLocation).toBe(location);
    }),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify component interactions:

- API endpoint to database flow
- Frontend component to API service flow
- Notification service integration
- Real-time update mechanism
- Audit logging integration

### Testing Library Selection

- **Backend:** Jest with fast-check for property-based testing
- **Frontend:** Jest + React Testing Library with fast-check
- **API Testing:** Supertest for endpoint testing
- **Database:** In-memory MongoDB for test isolation

### Test Coverage Goals

- Unit test coverage: 80%+ for business logic
- Property tests: All 35 correctness properties implemented
- Integration tests: All critical user flows
- Edge cases: All error conditions and boundary cases

