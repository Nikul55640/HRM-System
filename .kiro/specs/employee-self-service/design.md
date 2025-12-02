# Design Document: Employee Self-Service Portal

## Overview

The Employee Self-Service (ESS) portal is a comprehensive web application that empowers employees to manage their personal information, view compensation details, track attendance and leave, and submit various requests without requiring HR intervention. The system provides a modern, intuitive interface built with React and shadcn/ui components, ensuring a seamless user experience across all self-service functions.

The portal serves as the primary interface for employees to interact with the HR system, reducing administrative overhead while increasing employee satisfaction through immediate access to information and streamlined request processes.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Employee Self-Service                     │
│                         Frontend                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │   Profile    │  │   Payslips   │     │
│  │  Component   │  │  Management  │  │    Viewer    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Leave     │  │  Attendance  │  │  Requests    │     │
│  │   Balance    │  │    Viewer    │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Services                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Employee   │  │   Payroll    │  │   Leave      │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Attendance  │  │   Request    │  │  Document    │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    MongoDB                            │  │
│  │  - Employees  - Payslips  - Leaves  - Requests       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with hooks
- shadcn/ui component library
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching and caching
- Zustand for state management
- React Hook Form for form handling
- Zod for validation

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Node-cron for scheduled tasks

## Components and Interfaces

### 1. Dashboard Component

**Purpose:** Central hub providing overview and quick access to all self-service features

**Key Features:**
- Widget-based layout with drag-and-drop customization
- Quick stats (leave balance, pending requests, recent payslips)
- Notification center for pending actions
- Quick action buttons for common tasks

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Employee Self-Service Dashboard                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Leave Balance│  │  Attendance  │  │   Pending    │ │
│  │   15 days    │  │   22/22 days │  │  Requests: 2 │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Recent Activity                                   │ │
│  │  • Payslip for December 2025 available            │ │
│  │  • Leave request approved                         │ │
│  │  • Reimbursement claim pending                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Quick Actions                                     │ │
│  │  [Apply Leave] [View Payslip] [Submit Request]   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 2. Profile Management Component

**Purpose:** Allow employees to view and update personal information

**Sub-components:**
- PersonalInfoForm: Contact details, address, emergency contacts
- BankDetailsForm: Bank account information with masking
- DocumentUpload: Upload and manage personal documents
- ChangeHistory: Audit trail of profile changes

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  My Profile                                    [Edit]    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │ Personal Information                                ││
│  │ Email: john.doe@company.com                        ││
│  │ Phone: +1 234-567-8900                             ││
│  │ Address: 123 Main St, City, State 12345           ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Bank Details                              [Update]  ││
│  │ Account: ****1234                                  ││
│  │ Bank: ABC Bank                                     ││
│  │ IFSC: ABCD0001234                                  ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Documents                              [Upload New] ││
│  │ • ID Proof.pdf                         [Download]  ││
│  │ • Address Proof.pdf                    [Download]  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 3. Payslip Viewer Component

**Purpose:** Display and download payslips with detailed breakdown

**Features:**
- Month/year filter
- PDF download
- Earnings and deductions breakdown
- Year-to-date summary
- Search and filter functionality

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Payslips                    [Filter: 2025 ▼]           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │ December 2025                         [Download PDF]││
│  │ ┌─────────────────┐  ┌─────────────────┐          ││
│  │ │ Earnings        │  │ Deductions      │          ││
│  │ │ Basic: $5,000   │  │ Tax: $800       │          ││
│  │ │ HRA: $1,000     │  │ Insurance: $200 │          ││
│  │ │ Bonus: $500     │  │ PF: $600        │          ││
│  │ └─────────────────┘  └─────────────────┘          ││
│  │ Net Pay: $4,900                                    ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ November 2025                         [Download PDF]││
│  │ Net Pay: $5,200                                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 4. Leave Balance Component

**Purpose:** Display leave balances and history

**Features:**
- Leave balance by type (Annual, Sick, Personal)
- Leave history with status
- Upcoming approved leaves
- Quick apply leave action
- Export leave summary

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Leave Management                      [Apply Leave]    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Annual Leave │  │  Sick Leave  │  │Personal Leave│ │
│  │   15/20 days │  │   8/10 days  │  │   3/5 days   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Leave History                                       ││
│  │ ┌─────────────────────────────────────────────────┐││
│  │ │ Dec 20-22, 2025 | Annual | Approved            │││
│  │ │ Nov 15, 2025    | Sick   | Approved            │││
│  │ │ Oct 10-12, 2025 | Annual | Pending             │││
│  │ └─────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 5. Attendance Viewer Component

**Purpose:** Display attendance records and work hours

**Features:**
- Calendar view with color-coded attendance
- Daily check-in/out times
- Monthly summary
- Late arrivals and early departures highlighted
- Export attendance report

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  Attendance                    [Month: December 2025 ▼] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐│
│  │        December 2025 Calendar                       ││
│  │  S  M  T  W  T  F  S                               ││
│  │        1  2  3  4  5  6                            ││
│  │  7  8  9 10 11 12 13                               ││
│  │ 14 15 16 17 18 19 20                               ││
│  │ 21 22 23 24 25 26 27                               ││
│  │ 28 29 30 31                                        ││
│  │ ● Present  ○ Absent  ◐ Half Day  ▲ Late           ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Summary                                             ││
│  │ Present: 22 days | Absent: 0 | Late: 2             ││
│  │ Total Hours: 176 hrs                               ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 6. Request Management Component

**Purpose:** Submit and track various employee requests

**Request Types:**
- Reimbursement claims
- Loan/advance requests
- Transfer requests
- Shift change requests

**UI Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  My Requests                          [New Request ▼]   │
├─────────────────────────────────────────────────────────┤
│  [All] [Pending] [Approved] [Rejected]                  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Reimbursement - Travel Expenses                     ││
│  │ Amount: $250 | Status: Pending                      ││
│  │ Submitted: Dec 15, 2025                             ││
│  │ [View Details]                                      ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Salary Advance                                      ││
│  │ Amount: $1,000 | Status: Approved                   ││
│  │ Submitted: Dec 10, 2025                             ││
│  │ [View Details]                                      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Data Models

### Employee Profile Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  personalInfo: {
    email: String,
    phone: String,
    alternatePhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  bankDetails: {
    accountNumber: String, // Encrypted
    bankName: String,
    ifscCode: String,
    accountHolderName: String,
    verificationStatus: String, // 'pending', 'verified', 'rejected'
    verifiedAt: Date,
    verifiedBy: ObjectId
  },
  documents: [{
    type: String, // 'id_proof', 'address_proof', 'education', 'other'
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,
    status: String // 'pending', 'approved', 'rejected'
  }],
  changeHistory: [{
    field: String,
    oldValue: Mixed,
    newValue: Mixed,
    changedAt: Date,
    changedBy: ObjectId,
    approvalStatus: String,
    approvedBy: ObjectId,
    approvedAt: Date
  }],
  updatedAt: Date
}
```

### Payslip Model
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId,
  month: Number, // 1-12
  year: Number,
  earnings: {
    basic: Number,
    hra: Number,
    allowances: [{
      name: String,
      amount: Number
    }],
    bonus: Number,
    overtime: Number,
    total: Number
  },
  deductions: {
    tax: Number,
    providentFund: Number,
    insurance: Number,
    loan: Number,
    other: [{
      name: String,
      amount: Number
    }],
    total: Number
  },
  netPay: Number,
  pdfUrl: String,
  generatedAt: Date,
  status: String // 'draft', 'published'
}
```

### Leave Balance Model
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId,
  year: Number,
  leaveTypes: [{
    type: String, // 'annual', 'sick', 'personal', 'maternity', etc.
    allocated: Number,
    used: Number,
    pending: Number,
    available: Number
  }],
  history: [{
    leaveRequestId: ObjectId,
    type: String,
    startDate: Date,
    endDate: Date,
    days: Number,
    status: String,
    appliedAt: Date
  }],
  updatedAt: Date
}
```

### Attendance Record Model
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId,
  date: Date,
  checkIn: Date,
  checkOut: Date,
  workHours: Number,
  status: String, // 'present', 'absent', 'half_day', 'leave', 'holiday'
  isLate: Boolean,
  isEarlyDeparture: Boolean,
  remarks: String,
  location: {
    checkIn: { lat: Number, lng: Number },
    checkOut: { lat: Number, lng: Number }
  }
}
```

### Request Model
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId,
  requestType: String, // 'reimbursement', 'advance', 'transfer', 'shift_change'
  status: String, // 'pending', 'approved', 'rejected', 'cancelled'
  
  // Reimbursement specific
  reimbursement: {
    expenseType: String,
    amount: Number,
    description: String,
    receipts: [{
      fileName: String,
      fileUrl: String
    }],
    expenseDate: Date
  },
  
  // Advance specific
  advance: {
    amount: Number,
    reason: String,
    repaymentMonths: Number,
    monthlyDeduction: Number,
    outstandingBalance: Number
  },
  
  // Transfer specific
  transfer: {
    currentDepartment: ObjectId,
    requestedDepartment: ObjectId,
    currentLocation: String,
    requestedLocation: String,
    reason: String,
    preferredDate: Date
  },
  
  // Shift change specific
  shiftChange: {
    currentShift: String,
    requestedShift: String,
    reason: String,
    effectiveDate: Date
  },
  
  submittedAt: Date,
  approvalWorkflow: [{
    approver: ObjectId,
    role: String,
    status: String,
    comments: String,
    actionDate: Date
  }],
  finalApprover: ObjectId,
  finalApprovalDate: Date,
  rejectionReason: String
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Profile update validation
*For any* employee profile update, when contact details are modified, the system should validate email format and phone number format before allowing submission.
**Validates: Requirements 1.3**

### Property 2: Sensitive field approval requirement
*For any* profile change involving sensitive fields (bank details, personal identification), the system should require HR approval before the changes are reflected in the employee record.
**Validates: Requirements 1.4, 2.3**

### Property 3: Bank information masking
*For any* bank account display, the system should mask all but the last 4 digits of the account number when rendering to the UI.
**Validates: Requirements 2.5**

### Property 4: Document format validation
*For any* document upload, the system should only accept files with extensions PDF, JPG, or PNG and reject all other formats.
**Validates: Requirements 3.1**

### Property 5: Document encryption
*For any* sensitive document stored in the system, the file should be encrypted at rest and decrypted only when accessed by authorized users.
**Validates: Requirements 3.3**

### Property 6: Payslip authentication requirement
*For any* payslip access request, the system should verify the user is authenticated and authorized to view only their own payslips.
**Validates: Requirements 4.5**

### Property 7: Leave balance calculation accuracy
*For any* leave balance display, the available leave should equal allocated leave minus (used leave plus pending leave).
**Validates: Requirements 5.1**

### Property 8: Attendance summary consistency
*For any* monthly attendance summary, the total days should equal the sum of present, absent, leave, and holiday days for that month.
**Validates: Requirements 6.2**

### Property 9: Work hours calculation
*For any* attendance record with check-in and check-out times, the calculated work hours should equal the time difference between check-out and check-in.
**Validates: Requirements 6.4**

### Property 10: Receipt upload validation
*For any* reimbursement claim, the system should require at least one receipt attachment and validate file size is within limits before submission.
**Validates: Requirements 7.3**

### Property 11: Advance eligibility validation
*For any* loan or advance request, the system should validate the requested amount against the employee's eligibility criteria (salary, tenure, existing loans) before allowing submission.
**Validates: Requirements 8.2**

### Property 12: Request routing consistency
*For any* submitted request, the system should route it through the defined approval workflow based on request type and employee hierarchy.
**Validates: Requirements 7.4, 8.3, 9.3**

### Property 13: Dashboard data consistency
*For any* dashboard display, the leave balance, attendance count, and pending request count should match the actual data in their respective modules.
**Validates: Requirements 10.2**

### Property 14: Notification generation
*For any* status change on a request or approval action, the system should generate a notification for the employee.
**Validates: Requirements 10.4**

### Property 15: Change history audit trail
*For any* profile modification, the system should log the change with old value, new value, timestamp, and user who made the change.
**Validates: Requirements 1.5**

## Error Handling

### Client-Side Error Handling

1. **Form Validation Errors**
   - Display inline validation messages
   - Prevent submission until all fields are valid
   - Use Zod schemas for consistent validation

2. **Network Errors**
   - Show toast notifications for failed API calls
   - Implement retry logic with exponential backoff
   - Display user-friendly error messages

3. **File Upload Errors**
   - Validate file size and format before upload
   - Show progress indicators
   - Handle upload failures gracefully

4. **Authentication Errors**
   - Redirect to login on 401 errors
   - Refresh tokens automatically
   - Clear sensitive data on logout

### Server-Side Error Handling

1. **Validation Errors**
   - Return 400 with detailed validation messages
   - Use Joi or Zod for request validation
   - Sanitize error messages before sending to client

2. **Authorization Errors**
   - Return 403 for insufficient permissions
   - Log unauthorized access attempts
   - Implement rate limiting

3. **Database Errors**
   - Handle connection failures
   - Implement transaction rollback
   - Log errors for debugging

4. **File Processing Errors**
   - Validate file integrity
   - Handle encryption/decryption failures
   - Clean up failed uploads

## Testing Strategy

### Unit Testing

**Framework:** Jest with React Testing Library

**Coverage Areas:**
1. Component rendering and user interactions
2. Form validation logic
3. Data transformation utilities
4. API service functions
5. State management logic

**Example Unit Tests:**
- Profile form validates email format correctly
- Bank account number is properly masked in display
- Leave balance calculation is accurate
- File upload validates format and size
- Request status badge displays correct color

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with format: `**Feature: employee-self-service, Property {number}: {property_text}**`

**Property Tests:**
1. Profile update validation property
2. Sensitive field approval requirement property
3. Bank information masking property
4. Document format validation property
5. Leave balance calculation property
6. Attendance summary consistency property
7. Work hours calculation property
8. Receipt upload validation property
9. Advance eligibility validation property
10. Request routing consistency property

### Integration Testing

**Framework:** Cypress or Playwright

**Test Scenarios:**
1. Complete profile update flow with approval
2. Payslip download end-to-end
3. Leave application and balance update
4. Reimbursement claim submission with file upload
5. Dashboard data loading and display

### End-to-End Testing

**Critical User Journeys:**
1. Employee logs in → views dashboard → applies for leave
2. Employee updates bank details → waits for approval → verifies update
3. Employee uploads document → views in profile → downloads
4. Employee submits reimbursement → tracks status → receives approval
5. Employee views payslip → downloads PDF → verifies details

## Security Considerations

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Session management with secure cookies

2. **Data Protection**
   - Encrypt sensitive data at rest (bank details, documents)
   - Use HTTPS for all communications
   - Implement CORS policies

3. **Input Validation**
   - Sanitize all user inputs
   - Validate file uploads
   - Prevent SQL injection and XSS attacks

4. **Audit Logging**
   - Log all profile changes
   - Track document access
   - Monitor failed login attempts

5. **File Security**
   - Scan uploaded files for malware
   - Restrict file types and sizes
   - Store files in secure locations with access controls

## Performance Optimization

1. **Frontend Optimization**
   - Lazy load components
   - Implement virtual scrolling for large lists
   - Cache API responses with React Query
   - Optimize images and assets

2. **Backend Optimization**
   - Index database queries
   - Implement pagination
   - Use caching (Redis) for frequently accessed data
   - Optimize file storage and retrieval

3. **API Optimization**
   - Implement rate limiting
   - Use compression for responses
   - Batch API requests where possible
   - Implement efficient query patterns

## Accessibility

1. **WCAG 2.1 AA Compliance**
   - Proper heading hierarchy
   - Alt text for images
   - Keyboard navigation support
   - Screen reader compatibility

2. **UI Considerations**
   - Sufficient color contrast
   - Focus indicators
   - Error messages associated with form fields
   - Responsive design for mobile devices

## Future Enhancements

1. **Mobile Application**
   - Native iOS and Android apps
   - Push notifications
   - Biometric authentication

2. **Advanced Features**
   - AI-powered expense categorization
   - Chatbot for HR queries
   - Predictive leave planning
   - Integration with calendar apps

3. **Analytics Dashboard**
   - Personal productivity metrics
   - Leave pattern analysis
   - Expense tracking insights
