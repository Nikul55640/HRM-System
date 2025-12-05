# Implementation Plan

- [x] 1. Set up property-based testing infrastructure



  - Install fast-check library for JavaScript/TypeScript
  - Configure Jest to work with fast-check
  - Create test utility generators for common data types (employeeId, timestamps, IP addresses, work locations)
  - Set up test configuration with minimum 100 iterations per property test
  - _Requirements: All testing requirements_


- [x] 2. Extend AttendanceRecord model with sessions support

  - Add sessions array field to schema with session sub-schema
  - Add breaks array within session sub-schema
  - Create indexes for efficient session queries
  - Implement backward compatibility logic (map first/last session to checkIn/checkOut)
  - Add validation for work location enum values
  - Add encrypted IP address fields
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.3, 4.1, 4.2_

- [ ]* 2.1 Write property test for session creation
  - **Property 1: Session creation on clock-in**
  - **Validates: Requirements 1.1**

- [ ]* 2.2 Write property test for session completion
  - **Property 2: Session completion on clock-out**
  - **Validates: Requirements 1.2**

- [ ]* 2.3 Write property test for multiple sessions
  - **Property 3: Multiple sessions per day**
  - **Validates: Requirements 1.3**

- [ ]* 2.4 Write property test for break duration calculation
  - **Property 9: Break duration calculation**
  - **Validates: Requirements 2.4**

- [ ]* 2.5 Write property test for work time calculation
  - **Property 29: Work time calculation accuracy**
  - **Validates: Requirements 7.4**


- [x] 3. Implement IP encryption utilities

  - Create IPService class with encrypt/decrypt methods
  - Use crypto library for AES-256 encryption
  - Add environment variable for encryption key
  - Implement IP capture from request headers
  - Handle cases where IP cannot be determined
  - _Requirements: 4.1, 4.2, 4.5_

- [ ]* 3.1 Write property test for IP encryption round-trip
  - **Property 18: IP encryption**
  - **Validates: Requirements 4.5**

- [x] 4. Create session management API endpoints


  - Implement POST /employee/attendance/session/start endpoint
  - Implement POST /employee/attendance/session/end endpoint
  - Implement GET /employee/attendance/sessions endpoint
  - Add location selection validation
  - Add IP capture on session start/end
  - Add server-side timestamp generation
  - Prevent duplicate clock-in for active sessions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 4.1, 4.2, 8.2_

- [ ]* 4.1 Write property test for duplicate clock-in prevention
  - **Property 4: Duplicate clock-in prevention**
  - **Validates: Requirements 1.4**

- [ ]* 4.2 Write property test for location requirement
  - **Property 11: Location requirement validation**
  - **Validates: Requirements 3.2**

- [ ]* 4.3 Write property test for location storage round-trip
  - **Property 12: Location storage round-trip**
  - **Validates: Requirements 3.3**

- [ ]* 4.4 Write property test for server timestamp enforcement
  - **Property 32: Server timestamp enforcement**
  - **Validates: Requirements 8.2**


- [x] 5. Create break management API endpoints

  - Implement POST /employee/attendance/break/start endpoint
  - Implement POST /employee/attendance/break/end endpoint
  - Validate session is active before starting break
  - Validate break is active before ending break
  - Calculate and store break duration
  - Update session status (active/on_break)
  - Prevent clock-out while on break
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 5.1 Write property test for break recording
  - **Property 7: Break recording and state change**
  - **Validates: Requirements 2.2**

- [ ]* 5.2 Write property test for break retrieval
  - **Property 10: Break retrieval completeness**
  - **Validates: Requirements 2.5**

- [x] 6. Implement live attendance query endpoints


  - Create GET /admin/attendance/live endpoint
  - Query for all active sessions (not completed)
  - Include employee details (name, department)
  - Include session details (clock-in time, location, status)
  - Include current break information if on break
  - Calculate real-time worked duration
  - Add role-based access control (HR/Admin only)
  - _Requirements: 5.3, 5.4, 5.5_

- [ ]* 6.1 Write property test for live attendance query accuracy
  - **Property 19: Live attendance query accuracy**
  - **Validates: Requirements 5.3**

- [ ]* 6.2 Write property test for live attendance data completeness
  - **Property 20: Live attendance data completeness**
  - **Validates: Requirements 5.4**

- [ ]* 6.3 Write property test for break status reflection
  - **Property 21: Break status reflection in live attendance**
  - **Validates: Requirements 5.5**

- [x] 7. Integrate notification service for attendance events


  - Extend NotificationService with attendance notification methods
  - Create notification on session start (clock-in)
  - Create notification on session end (clock-out)
  - Include employee name, action type, timestamp, and location in notification
  - Respect HR administrator notification preferences
  - Implement notification batching for simultaneous events
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 7.1 Write property test for clock-in notification
  - **Property 22: Clock-in notification creation**
  - **Validates: Requirements 6.1**

- [ ]* 7.2 Write property test for clock-out notification
  - **Property 23: Clock-out notification creation**
  - **Validates: Requirements 6.2**

- [ ]* 7.3 Write property test for notification content
  - **Property 24: Notification content completeness**
  - **Validates: Requirements 6.3**

- [ ]* 7.4 Write property test for notification preferences
  - **Property 25: Notification preference respect**
  - **Validates: Requirements 6.4**

- [x] 8. Checkpoint - Ensure all backend tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create IP detection service for frontend


  - Create IPDetectionService class
  - Implement getClientIP method using third-party API (ipify or similar)
  - Add fallback mechanism if IP detection fails
  - Handle network errors gracefully
  - _Requirements: 4.1, 4.2_

- [x] 10. Create location selection modal component


  - Create LocationSelectionModal component
  - Add radio group for Office/WFH/Client Site options
  - Add conditional text input for client site details
  - Add form validation
  - Add confirm and cancel buttons
  - Style with existing UI components (shadcn/ui)
  - _Requirements: 3.1, 3.2, 3.5_



- [ ] 11. Enhance ClockInOut component with sessions support
  - Update to handle multiple sessions per day
  - Add location modal trigger on clock-in
  - Display all sessions for current day
  - Add break start/end buttons
  - Update button states based on session status (active/on_break/completed)
  - Show current break duration if on break
  - Display session-specific information (location, times)
  - Integrate IP detection service
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [ ]* 11.1 Write unit tests for ClockInOut component
  - Test rendering with no sessions
  - Test rendering with active session
  - Test rendering with completed sessions
  - Test button states based on session status
  - Test location modal display


  - Test break button states

- [ ] 12. Create session history view component
  - Create SessionHistoryView component
  - Display sessions grouped by date
  - Show session details (clock-in, clock-out, location, duration)
  - Display breaks within each session
  - Calculate and display worked time (excluding breaks)
  - Add date range filter
  - Add work location filter
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 12.1 Write property test for session grouping
  - **Property 26: Session grouping by date**
  - **Validates: Requirements 7.1**

- [ ]* 12.2 Write property test for session display completeness
  - **Property 27: Session display completeness**
  - **Validates: Requirements 7.2**

- [ ]* 12.3 Write property test for break display completeness
  - **Property 28: Break display completeness**
  - **Validates: Requirements 7.3**



- [ ]* 12.4 Write property test for attendance filtering
  - **Property 30: Attendance history filtering**
  - **Validates: Requirements 7.5**

- [ ] 13. Create live attendance dashboard for HR
  - Create LiveAttendanceDashboard component
  - Fetch live attendance data from API
  - Display employee cards with current status
  - Show employee name, clock-in time, location, status
  - Show current break information if on break
  - Calculate and display real-time worked duration
  - Add auto-refresh mechanism (polling every 30 seconds)
  - Add manual refresh button
  - Add filter by department/location
  - Restrict access to HR/Admin roles
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 13.1 Write unit tests for LiveAttendanceDashboard
  - Test rendering with no active employees


  - Test rendering with active employees
  - Test employee card display
  - Test status indicators
  - Test auto-refresh mechanism
  - Test filtering functionality

- [ ] 14. Implement data validation and integrity checks
  - Add validation for required fields on record creation
  - Validate timestamps are not in the future
  - Validate clock-out is after clock-in
  - Validate break end is after break start
  - Detect and flag inconsistent records
  - Prevent employee modification of past records
  - Add audit logging for all record access
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 14.1 Write property test for required field validation
  - **Property 31: Required field validation**
  - **Validates: Requirements 8.1**

- [ ]* 14.2 Write property test for historical record immutability
  - **Property 33: Historical record immutability**
  - **Validates: Requirements 8.3**



- [ ]* 14.3 Write property test for audit trail creation
  - **Property 34: Audit trail creation**
  - **Validates: Requirements 8.4**

- [ ]* 14.4 Write property test for inconsistency detection
  - **Property 35: Inconsistency detection**


  - **Validates: Requirements 8.5**

- [ ] 15. Update API routes and integrate new endpoints
  - Add new session routes to employee routes
  - Add new break routes to employee routes
  - Add live attendance routes to admin routes
  - Update route middleware for authentication
  - Update route middleware for role-based access
  - _Requirements: All API requirements_


- [ ] 16. Update existing attendance queries to support sessions
  - Modify getAttendanceRecords to return sessions array
  - Update getMonthlySummary to aggregate across all sessions
  - Ensure backward compatibility with existing records
  - Update attendance export to include session details
  - _Requirements: 1.5, 7.1, 7.2, 7.3, 7.4, 7.5_



- [ ]* 16.1 Write property test for session retrieval completeness
  - **Property 5: Session retrieval completeness**
  - **Validates: Requirements 1.5**

- [ ] 17. Add error handling and user feedback
  - Implement all validation error responses
  - Implement all authorization error responses
  - Add user-friendly error messages in frontend
  - Add toast notifications for success/error states
  - Handle IP detection failures gracefully
  - Handle notification failures gracefully
  - _Requirements: All error handling requirements_

- [ ] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
