# Implementation Plan: Employee Self-Service Portal

- [x] 1. Set up project structure and core services
  - Create directory structure for employee self-service components
  - Set up API service layer for employee endpoints
  - Configure React Query for data fetching and caching
  - Set up Zustand store for global state management
  - _Requirements: All_

- [x] 2. Implement Dashboard Component
  - [x] 2.1 Create dashboard layout with widget grid
    - Build responsive grid layout using shadcn/ui Card components
    - Implement widget components (LeaveBalanceWidget, AttendanceWidget, RequestsWidget)
    - Add quick stats display with icons
    - _Requirements: 10.1, 10.2_

  - [x] 2.2 Implement notification center
    - Create notification list component
    - Add notification badge with count
    - Implement mark as read functionality
    - _Requirements: 10.4_

  - [x] 2.3 Add quick action buttons
    - Create quick action menu with common tasks
    - Implement navigation to respective modules
    - Add keyboard shortcuts for accessibility
    - _Requirements: 10.3_

  - [x] 2.4 Write property test for dashboard data consistency
    - **Property 13: Dashboard data consistency**
    - **Validates: Requirements 10.2**

  - [ ]* 2.5 Write unit tests for dashboard components
    - Test widget rendering with mock data
    - Test notification display and interactions
    - Test quick action navigation
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 3. Implement Profile Management Module
  - [x] 3.1 Create PersonalInfoForm component
    - Build form with React Hook Form and Zod validation
    - Implement email and phone validation
    - Add address fields with proper formatting
    - Add emergency contact section
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.2 Write property test for profile update validation
    - **Property 1: Profile update validation**
    - **Validates: Requirements 1.3**

  - [x] 3.3 Implement change approval workflow
    - Create approval status indicator
    - Add change history display
    - Implement notification on approval/rejection
    - _Requirements: 1.4, 1.5_

  - [x] 3.4 Write property test for sensitive field approval



    - **Property 2: Sensitive field approval requirement**
    - **Validates: Requirements 1.4**

  - [x] 3.5 Write property test for change history audit trail




    - **Property 15: Change history audit trail**
    - **Validates: Requirements 1.5**

  - [ ]* 3.6 Write unit tests for profile forms
    - Test form validation rules
    - Test submission handling
    - Test error display
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Implement Bank Details Management
  - [x] 4.1 Create BankDetailsForm component
    - Build secure form for bank information
    - Implement IFSC code validation
    - Add account number confirmation field
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Implement bank account masking
    - Create utility function to mask account numbers
    - Display masked account in view mode
    - Show full account only in edit mode with verification
    - _Requirements: 2.5_


  - [x] 4.3 Write property test for bank information masking


    - **Property 3: Bank information masking**
    - **Validates: Requirements 2.5**


  - [x] 4.4 Create backend bank details controller and model


    - Implement EmployeeProfile model with bank details schema
    - Create bankDetailsController with get, update, and verify endpoints
    - Add encryption for account numbers at rest
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 4.5 Implement bank details approval workflow


    - Add verification status indicator
    - Create approval request notification
    - Update payroll system on approval
    - _Requirements: 2.3, 2.4_

  - [ ]* 4.6 Write unit tests for bank details management
    - Test masking function with various inputs
    - Test form validation
    - Test approval workflow
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 5. Implement Document Management
  - [x] 5.1 Create DocumentUpload component
    - Build file upload interface with drag-and-drop
    - Implement file type validation (PDF, JPG, PNG)
    - Add file size validation
    - Show upload progress indicator
    - _Requirements: 3.1, 3.2_

  - [x] 5.2 Write property test for document format validation


    - **Property 4: Document format validation**
    - **Validates: Requirements 3.1**

  - [x] 5.3 Implement document encryption


    - Add encryption for sensitive documents on upload
    - Implement decryption on download
    - Store encrypted files securely
    - _Requirements: 3.3_

  - [x] 5.4 Write property test for document encryption


    - **Property 5: Document encryption**
    - **Validates: Requirements 3.3**

  - [x] 5.5 Create document list and viewer
    - Display uploaded documents with categories
    - Implement download functionality with access logging
    - Add document preview for images
    - _Requirements: 3.4, 3.5_

  - [ ]* 5.6 Write unit tests for document management
    - Test file upload validation
    - Test document list rendering
    - Test download functionality
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 6. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Payslip Viewer Module
  - [x] 7.1 Create PayslipList component
    - Build list view with month/year filters
    - Implement search functionality
    - Add sorting by date
    - Display net pay prominently
    - _Requirements: 4.1, 4.4_

  - [x] 7.2 Create PayslipDetail component
    - Build detailed breakdown view
    - Display earnings section with all components
    - Display deductions section with all components
    - Calculate and show net pay
    - Add year-to-date summary
    - _Requirements: 4.3_

  - [x] 7.3 Implement PDF download functionality
    - Add download button for each payslip
    - Generate PDF with proper formatting
    - Include company branding
    - _Requirements: 4.2_

  - [x] 7.4 Create backend payslip controller and model


    - Implement Payslip model with earnings and deductions schema
    - Create payslipsController with list, getById, and download endpoints
    - Add PDF generation functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.4_


  - [x] 7.5 Implement payslip authentication

    - Verify user can only access their own payslips
    - Add authorization checks on API endpoints
    - Log all payslip access attempts
    - _Requirements: 4.5_

  - [x] 7.6 Write property test for payslip authentication


    - **Property 6: Payslip authentication requirement**
    - **Validates: Requirements 4.5**

  - [ ]* 7.7 Write unit tests for payslip viewer
    - Test payslip list rendering
    - Test filter and search functionality
    - Test detail view calculations
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Implement Leave Balance Module
  - [x] 8.1 Create LeaveBalance component
    - Display leave balance cards by type
    - Show allocated, used, pending, and available leaves
    - Add visual progress indicators
    - _Requirements: 5.1_

  - [x] 8.2 Write property test for leave balance calculation


    - **Property 7: Leave balance calculation accuracy**
    - **Validates: Requirements 5.1**

  - [x] 8.3 Create LeaveHistory component
    - Display past leave applications in table
    - Show status with color-coded badges
    - Add date range filter
    - _Requirements: 5.2_


  - [x] 8.4 Create backend leave balance controller and model


    - Implement LeaveBalance model with leave types schema
    - Create leaveController with balance, history, and export endpoints
    - Add leave calculation logic
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.5 Implement pending and upcoming leaves display


    - Show pending leave requests
    - Display upcoming approved leaves in calendar view
    - Add quick cancel option for pending requests
    - _Requirements: 5.3, 5.4_


  - [x] 8.6 Add leave summary export

    - Implement export to PDF functionality
    - Include all leave types and balances
    - Add leave history in export
    - _Requirements: 5.5_

  - [ ]* 8.7 Write unit tests for leave balance module
    - Test balance calculation display
    - Test leave history rendering
    - Test export functionality
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Implement Attendance Viewer Module
  - [x] 9.1 Create AttendanceCalendar component
    - Build calendar view with color-coded days
    - Implement month navigation
    - Show legend for attendance status
    - Highlight late arrivals and early departures
    - _Requirements: 9.1, 9.3_

  - [x] 9.2 Create AttendanceDetail component
    - Display daily check-in/check-out times
    - Show work hours for each day
    - Add remarks section
    - _Requirements: 9.2_

  - [x] 9.3 Implement attendance summary
    - Calculate total present, absent, and late days
    - Calculate total work hours for the month
    - Display summary statistics
    - _Requirements: 9.2, 9.4_


  - [x] 9.4 Write property test for attendance summary consistency

    - **Property 8: Attendance summary consistency**
    - **Validates: Requirements 6.2**

  - [x] 9.5 Write property test for work hours calculation



    - **Property 9: Work hours calculation**
    - **Validates: Requirements 6.4**

  - [x] 9.6 Create backend attendance controller and model







    - Implement AttendanceRecord model with check-in/out schema
    - Create attendanceController with records, summary, and export endpoints
    - Add work hours calculation logic
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


  - [x] 9.7 Add attendance report export


    - Implement export to PDF/Excel
    - Include calendar view and summary
    - Add detailed daily records
    - _Requirements: 9.5_

  - [ ]* 9.8 Write unit tests for attendance viewer
    - Test calendar rendering
    - Test summary calculations
    - Test export functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_



- [x] 10. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.


- [ ] 11. Implement Reimbursement Request Module
  - [ ] 11.1 Create ReimbursementForm component
    - Build form with expense type dropdown
    - Add amount and description fields
    - Implement receipt upload with multiple files
    - Add expense date picker
    - _Requirements: 7.1, 7.2_

  - [ ] 11.2 Write property test for receipt upload validation
    - **Property 10: Receipt upload validation**
    - **Validates: Requirements 7.3**

  - [ ] 11.3 Implement reimbursement submission
    - Validate all required fields
    - Upload receipts to server
    - Submit request to approval workflow
    - Show success confirmation
    - _Requirements: 7.3, 7.4_

  - [ ] 11.4 Create ReimbursementList component
    - Display all reimbursement requests
    - Show status with badges
    - Add filter by status
    - Implement detail view modal
    - _Requirements: 7.4_

  - [ ]* 11.5 Write unit tests for reimbursement module
    - Test form validation
    - Test file upload
    - Test submission flow
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Implement Loan/Advance Request Module

  - [ ] 12.1 Create AdvanceRequestForm component
    - Build form with amount and reason fields
    - Add repayment period selector
    - Show calculated monthly deduction
    - Display eligibility information
    - _Requirements: 8.1_

  - [ ] 12.2 Implement advance eligibility validation
    - Check employee tenure and salary
    - Validate against existing loans
    - Calculate maximum eligible amount
    - Show validation errors
    - _Requirements: 8.2_

  - [ ] 12.3 Write property test for advance eligibility validation
    - **Property 11: Advance eligibility validation**
    - **Validates: Requirements 8.2**

  - [ ] 12.4 Implement advance submission and tracking
    - Submit request to approval workflow
    - Calculate repayment schedule on approval
    - Display outstanding balance
    - Show repayment history
    - _Requirements: 8.3, 8.4, 8.5_

  - [ ]* 12.5 Write unit tests for advance request module
    - Test eligibility calculation
    - Test repayment schedule calculation
    - Test form validation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 13. Implement Transfer and Shift Change Module

  - [ ] 13.1 Create TransferRequestForm component
    - Build form with department and location selectors
    - Add reason text area
    - Add preferred date picker
    - Show current assignment
    - _Requirements: 9.1_

  - [ ] 13.2 Create ShiftChangeForm component
    - Display current shift information
    - Show available shifts
    - Add reason field
    - Add effective date picker
    - _Requirements: 9.2_

  - [ ] 13.3 Implement request submission and routing
    - Route to manager and HR for approval
    - Update employee records on approval
    - Send notifications to all parties
    - _Requirements: 9.3, 9.4_

  - [ ] 13.4 Create request tracking view
    - Display request status
    - Show approval workflow progress
    - Add comments from approvers
    - _Requirements: 9.5_

  - [ ]* 13.5 Write unit tests for transfer and shift change
    - Test form validation
    - Test submission flow
    - Test status tracking
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Implement Request Management Dashboard
  - [x] 14.1 Create unified RequestList component
    - Display all request types in single view
    - Add filter by request type and status
    - Implement search functionality
    - Show request cards with key information
    - _Requirements: All request requirements_

  - [ ] 14.2 Implement request detail modal


    - Show full request details
    - Display approval workflow status
    - Show comments and history
    - Add cancel option for pending requests
    - _Requirements: All request requirements_


  - [ ] 14.3 Write property test for request routing consistency
    - **Property 12: Request routing consistency**
    - **Validates: Requirements 7.4, 8.3, 9.3**

  - [ ]* 14.4 Write unit tests for request management
    - Test request list rendering
    - Test filtering and search
    - Test detail modal
    - _Requirements: All request requirements_

- [x] 15. Implement Backend API Endpoints





  - [x] 15.1 Create employee profile endpoints


    - GET /api/employee/profile - Get employee profile
    - PUT /api/employee/profile - Update profile
    - POST /api/employee/profile/documents - Upload document
    - GET /api/employee/profile/documents - List documents
    - GET /api/employee/profile/history - Get change history
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.4, 3.5_



  - [x] 15.2 Create bank details endpoints

    - GET /api/employee/bank-details - Get bank details (masked)
    - PUT /api/employee/bank-details - Update bank details
    - POST /api/employee/bank-details/verify - Request verification

    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 15.3 Create payslip endpoints

    - GET /api/employee/payslips - List all payslips
    - GET /api/employee/payslips/:id - Get payslip details
    - GET /api/employee/payslips/:id/download - Download PDF
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


  - [x] 15.4 Create leave balance endpoints

    - GET /api/employee/leave-balance - Get leave balance
    - GET /api/employee/leave-history - Get leave history
    - GET /api/employee/leave-balance/export - Export summary
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


  - [x] 15.5 Create attendance endpoints

    - GET /api/employee/attendance - Get attendance records
    - GET /api/employee/attendance/summary - Get monthly summary
    - GET /api/employee/attendance/export - Export report
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


  - [x] 15.6 Create request endpoints

    - POST /api/employee/requests - Create new request
    - GET /api/employee/requests - List all requests
    - GET /api/employee/requests/:id - Get request details
    - PUT /api/employee/requests/:id/cancel - Cancel request
    - _Requirements: 7.1, 7.4, 8.1, 8.3, 9.1, 9.3_


  - [x] 15.7 Write integration tests for API endpoints

    - Test authentication and authorization
    - Test data validation
    - Test error handling
    - _Requirements: All_

- [ ] 16. Implement Notification System

  - [x] 16.1 Create notification service



    - Implement notification generation on status changes
    - Store notifications in database
    - Add notification preferences
    - _Requirements: 10.4_

  - [ ] 16.2 Write property test for notification generation
    - **Property 14: Notification generation**
    - **Validates: Requirements 10.4**

  - [ ] 16.3 Create notification UI components
    - Build notification dropdown
    - Add notification badge with count
    - Implement mark as read functionality
    - Add notification settings page
    - _Requirements: 10.4_

  - [ ] 16.4 Write unit tests for notification system
    - Test notification generation
    - Test notification display
    - Test mark as read
    - _Requirements: 10.4_


- [ ] 17. Implement Security Features
  - [ ] 17.1 Add authentication middleware
    - Verify JWT tokens on all endpoints
    - Implement token refresh logic
    - Add session management
    - _Requirements: All_

  - [ ] 17.2 Implement authorization checks
    - Verify employee can only access own data
    - Add role-based access control
    - Log unauthorized access attempts
    - _Requirements: All_

  - [ ] 17.3 Add data encryption
    - Encrypt bank account numbers
    - Encrypt sensitive documents
    - Implement secure key management
    - _Requirements: 2.5, 3.3_

  - [ ] 17.4 Implement audit logging
    - Log all profile changes
    - Log document access
    - Log request submissions and approvals
    - _Requirements: 1.5, 3.5_

  - [ ] 17.5 Write security tests
    - Test authentication flows
    - Test authorization checks
    - Test encryption/decryption
    - _Requirements: All_


- [ ] 18. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 19. Integration and Polish


  - [ ] 19.1 Implement responsive design
    - Ensure all components work on mobile
    - Test on various screen sizes
    - Optimize touch interactions
    - _Requirements: All_

  - [ ] 19.2 Add loading states and error handling
    - Implement skeleton loaders
    - Add error boundaries
    - Show user-friendly error messages
    - _Requirements: All_

  - [ ] 19.3 Optimize performance
    - Implement lazy loading for routes
    - Add React Query caching
    - Optimize bundle size
    - _Requirements: All_

  - [ ] 19.4 Ensure accessibility compliance
    - Add ARIA labels
    - Test keyboard navigation
    - Verify screen reader compatibility
    - Check color contrast
    - _Requirements: All_

  - [ ] 19.5 Write end-to-end tests
    - Test complete user journeys
    - Test cross-module interactions
    - Test error scenarios
    - _Requirements: All_
