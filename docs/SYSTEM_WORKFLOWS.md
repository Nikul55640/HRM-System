# HRM System - Workflow Diagrams & Process Flow

## 📋 Table of Contents
- [User Authentication Flow](#user-authentication-flow)
- [Employee Attendance Workflow](#employee-attendance-workflow)
- [Leave Management Workflow](#leave-management-workflow)
- [HR Employee Management Workflow](#hr-employee-management-workflow)
- [Notification System Flow](#notification-system-flow)
- [Data Access Control Flow](#data-access-control-flow)
- [System Integration Flow](#system-integration-flow)

---

## 🔐 User Authentication Flow

```mermaid
graph TD
    A[User Access] --> B{User Type?}
    B -->|Employee| C[Employee Login Page]
    B -->|Admin/HR| D[Admin Login Page]
    
    C --> E[Enter Credentials]
    D --> E
    
    E --> F[Validate Credentials]
    F -->|Invalid| G[Show Error]
    F -->|Valid| H[Generate JWT Token]
    
    H --> I[Set HTTP-Only Cookie]
    I --> J{User Role?}
    
    J -->|Employee| K[Employee Dashboard]
    J -->|HR| L[HR Dashboard]
    J -->|SuperAdmin| M[Admin Dashboard]
    J -->|Manager| N[Manager Dashboard]
    
    G --> E
```

### Authentication Process Details:
1. **Route Protection**: All protected routes check for valid JWT
2. **Role Verification**: Each route validates user permissions
3. **Token Refresh**: Automatic token refresh before expiration
4. **Session Management**: Secure session handling with HTTP-only cookies

---

## ⏰ Employee Attendance Workflow

```mermaid
graph TD
    A[Employee Arrives] --> B[Open Attendance Page]
    B --> C{Already Clocked In?}
    
    C -->|No| D[Show Clock In Button]
    C -->|Yes| E[Show Current Session]
    
    D --> F[Click Clock In]
    F --> G[Record Clock In Time]
    G --> H[Update Status: In Progress]
    H --> I[Show Work Session]
    
    E --> I
    I --> J{Break Time?}
    J -->|Yes| K[Start Break]
    K --> L[Record Break Start]
    L --> M[Show Break Timer]
    M --> N[End Break]
    N --> O[Record Break End]
    O --> I
    
    J -->|No| P{End of Day?}
    P -->|No| I
    P -->|Yes| Q[Click Clock Out]
    
    Q --> R[Record Clock Out Time]
    R --> S[Calculate Work Hours]
    S --> T[Calculate Overtime]
    T --> U[Update Status: Completed]
    U --> V[Send Completion Notification]
    
    W[System Auto Clock-Out] --> R
    X[30 min after shift end] --> W
```

### Attendance Rules:
- **Grace Period**: 15 minutes after shift start
- **Auto Clock-Out**: 30 minutes after shift end
- **Break Tracking**: Unlimited breaks with time tracking
- **Overtime Calculation**: Hours beyond 8 hours/day
- **Weekend Detection**: Automatic weekend marking

---

## 🏖️ Leave Management Workflow

```mermaid
graph TD
    A[Employee Needs Leave] --> B[Check Leave Balance]
    B --> C{Sufficient Balance?}
    
    C -->|No| D[Show Insufficient Balance]
    C -->|Yes| E[Fill Leave Application]
    
    E --> F[Select Leave Type]
    F --> G[Choose Dates]
    G --> H[Add Reason]
    H --> I[Upload Documents]
    I --> J[Submit Application]
    
    J --> K[Send to HR Queue]
    K --> L[Notify HR via Email/SSE]
    L --> M[HR Reviews Application]
    
    M --> N{HR Decision?}
    N -->|Approve| O[Update Leave Balance]
    N -->|Reject| P[Add Rejection Comments]
    
    O --> Q[Update Calendar]
    Q --> R[Notify Employee: Approved]
    R --> S[Send Email Confirmation]
    
    P --> T[Notify Employee: Rejected]
    T --> U[Send Email with Reason]
    
    V[Employee Can Cancel] --> W{Status?}
    W -->|Pending| X[Cancel Application]
    W -->|Approved| Y[Request Cancellation]
    
    X --> Z[Remove from Queue]
    Y --> AA[HR Reviews Cancellation]
```

### Leave Types & Rules:
- **Casual Leave**: 12 days/year, can be taken in advance
- **Sick Leave**: 6 days/year, medical certificate required for >2 days
- **Paid Leave**: 18 days/year, advance approval required

---

## 👥 HR Employee Management Workflow

```mermaid
graph TD
    A[HR Dashboard] --> B{Action Needed?}
    
    B -->|New Employee| C[Create Employee Profile]
    B -->|Update Employee| D[Edit Employee Data]
    B -->|View Records| E[Access Employee Records]
    B -->|Attendance Issue| F[Review Attendance]
    B -->|Leave Request| G[Process Leave Request]
    
    C --> H[Fill Employee Form]
    H --> I[Set Department/Designation]
    I --> J[Create User Account]
    J --> K[Assign Role & Permissions]
    K --> L[Send Welcome Email]
    L --> M[Add to System]
    
    D --> N[Select Employee]
    N --> O[Update Information]
    O --> P[Save Changes]
    P --> Q[Log Audit Trail]
    
    E --> R{Data Type?}
    R -->|Personal| S[View Profile Data]
    R -->|Attendance| T[View Attendance Records]
    R -->|Leave| U[View Leave History]
    R -->|Performance| V[View Performance Data]
    
    F --> W[Review Attendance Corrections]
    W --> X{Approve Correction?}
    X -->|Yes| Y[Update Attendance Record]
    X -->|No| Z[Reject with Comments]
    
    G --> AA[Review Leave Request]
    AA --> BB{Approve Leave?}
    BB -->|Yes| CC[Approve & Update Balance]
    BB -->|No| DD[Reject with Reason]
```

### HR Capabilities:
- **Full Employee Access**: View/edit all employee data
- **Attendance Management**: Approve corrections, mark absent/holiday
- **Leave Management**: Approve/reject leave requests
- **Reporting**: Generate various HR reports
- **Bulk Operations**: Mass updates and imports

---

## 🔔 Notification System Flow

```mermaid
graph TD
    A[System Event Occurs] --> B{Event Type?}
    
    B -->|Attendance| C[Attendance Event]
    B -->|Leave| D[Leave Event]
    B -->|System| E[System Event]
    B -->|HR Action| F[HR Action Event]
    
    C --> G{Attendance Type?}
    G -->|Late Clock-in| H[Late Notification]
    G -->|Absent| I[Absent Notification]
    G -->|Missing Clock-out| J[Incomplete Notification]
    
    D --> K{Leave Type?}
    K -->|Application| L[Leave Application Notification]
    K -->|Approval| M[Leave Approval Notification]
    K -->|Rejection| N[Leave Rejection Notification]
    
    E --> O[System Notification]
    F --> P[HR Action Notification]
    
    H --> Q[Create Notification Record]
    I --> Q
    J --> Q
    L --> Q
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R{Send Email?}
    R -->|Yes| S[Generate Email Template]
    R -->|No| T[Skip Email]
    
    S --> U[Send via Email Service]
    U --> V{Email Success?}
    V -->|Yes| W[Mark Email Sent]
    V -->|No| X[Log Email Error]
    
    T --> Y[Send SSE Notification]
    W --> Y
    X --> Y
    
    Y --> Z{User Online?}
    Z -->|Yes| AA[Deliver Real-time]
    Z -->|No| BB[Store for Later]
    
    AA --> CC[Show in UI]
    BB --> DD[Deliver on Next Login]
```

### Notification Channels:
- **Real-Time**: Server-Sent Events (SSE)
- **Email**: Multi-provider email system
- **In-App**: Notification bell with unread count
- **Database**: Persistent notification storage

---

## 🛡️ Data Access Control Flow

```mermaid
graph TD
    A[User Request] --> B[Extract JWT Token]
    B --> C{Token Valid?}
    
    C -->|No| D[Return 401 Unauthorized]
    C -->|Yes| E[Extract User Info]
    
    E --> F[Get User Role]
    F --> G{Resource Access?}
    
    G -->|Employee Data| H{Employee Access?}
    G -->|Attendance Data| I{Attendance Access?}
    G -->|Leave Data| J{Leave Access?}
    G -->|Admin Data| K{Admin Access?}
    
    H --> L{User Role?}
    L -->|Employee| M{Own Data?}
    L -->|HR| N[All Employee Data]
    L -->|Manager| O[Team Data Only]
    L -->|SuperAdmin| P[All Data]
    
    M -->|Yes| Q[Allow Access]
    M -->|No| R[Deny Access]
    
    I --> S{Attendance Role Check}
    S -->|Employee| T[Own Attendance Only]
    S -->|HR| U[All Attendance Data]
    S -->|SuperAdmin| V[All Attendance + System]
    
    J --> W{Leave Role Check}
    W -->|Employee| X[Own Leaves Only]
    W -->|HR| Y[All Leave Data]
    W -->|SuperAdmin| Z[All Leave + Policies]
    
    K --> AA{Admin Role Check}
    AA -->|SuperAdmin| BB[Full Admin Access]
    AA -->|HR_Manager| CC[Limited Admin Access]
    AA -->|Others| DD[No Admin Access]
    
    Q --> EE[Process Request]
    N --> EE
    O --> EE
    P --> EE
    T --> EE
    U --> EE
    V --> EE
    X --> EE
    Y --> EE
    Z --> EE
    BB --> EE
    CC --> EE
    
    R --> FF[Return 403 Forbidden]
    DD --> FF
```

### Access Control Matrix:
| Role | Own Data | Team Data | All Employee Data | System Admin |
|------|----------|-----------|-------------------|--------------|
| Employee | ✅ | ❌ | ❌ | ❌ |
| Manager | ✅ | ✅ | ❌ | ❌ |
| HR | ✅ | ✅ | ✅ | ❌ |
| HR_Manager | ✅ | ✅ | ✅ | Limited |
| SuperAdmin | ✅ | ✅ | ✅ | ✅ |

---

## 🔄 System Integration Flow

```mermaid
graph TD
    A[HRM System] --> B[External Integrations]
    A --> C[Internal Services]
    
    B --> D[Calendarific API]
    B --> E[Email Services]
    B --> F[File Storage]
    
    D --> G[Holiday Data Sync]
    G --> H[Update Holiday Calendar]
    H --> I[Notify Employees]
    
    E --> J{Email Provider?}
    J -->|SMTP| K[Gmail/Outlook]
    J -->|Resend| L[Resend Service]
    J -->|Mailtrap| M[Testing Service]
    
    K --> N[Send Email]
    L --> N
    M --> N
    
    F --> O[Document Storage]
    O --> P[Profile Photos]
    O --> Q[Leave Documents]
    O --> R[Company Documents]
    
    C --> S[Background Jobs]
    C --> T[Real-time Services]
    C --> U[Audit System]
    
    S --> V[Attendance Finalization]
    S --> W[Notification Cleanup]
    S --> X[Leave Balance Rollover]
    
    T --> Y[SSE Notifications]
    T --> Z[Live Attendance]
    
    U --> AA[Action Logging]
    U --> BB[Security Monitoring]
    U --> CC[Compliance Tracking]
```

### Integration Points:
- **Calendarific**: Automatic holiday data synchronization
- **Email Services**: Multi-provider email delivery
- **File Storage**: Secure document and image storage
- **Background Jobs**: Automated system maintenance
- **Real-time Updates**: Live data synchronization
- **Audit System**: Comprehensive activity logging

---

## 📊 Performance & Monitoring Flow

```mermaid
graph TD
    A[System Request] --> B[Performance Monitoring]
    B --> C[Response Time Tracking]
    B --> D[Error Rate Monitoring]
    B --> E[Resource Usage Tracking]
    
    C --> F{Response Time OK?}
    F -->|No| G[Performance Alert]
    F -->|Yes| H[Continue Monitoring]
    
    D --> I{Error Rate OK?}
    I -->|No| J[Error Alert]
    I -->|Yes| K[Continue Monitoring]
    
    E --> L{Resource Usage OK?}
    L -->|No| M[Resource Alert]
    L -->|Yes| N[Continue Monitoring]
    
    G --> O[Log Performance Issue]
    J --> P[Log Error Details]
    M --> Q[Log Resource Issue]
    
    O --> R[Notify Administrators]
    P --> R
    Q --> R
    
    R --> S[Investigate Issue]
    S --> T[Apply Fix]
    T --> U[Monitor Resolution]
    
    H --> V[Health Check]
    K --> V
    N --> V
    
    V --> W[System Status Dashboard]
    W --> X[Generate Reports]
    X --> Y[Performance Analytics]
```

### Monitoring Metrics:
- **Response Time**: API endpoint performance
- **Error Rates**: System error tracking
- **Resource Usage**: CPU, memory, database performance
- **User Activity**: Login patterns, feature usage
- **System Health**: Service availability and status

---

This workflow documentation provides visual representations of the key processes in the HRM system, helping developers and stakeholders understand how different components interact and how data flows through the system.