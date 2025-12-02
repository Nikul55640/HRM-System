# Requirements Document: Leave & Holiday Management

## Introduction

Comprehensive leave management system supporting multiple leave types, carry-forward, encashment, and public holiday management.

## Glossary

- **Leave Types**: Sick, Casual, Maternity/Paternity, Comp-off, Unpaid
- **Carry-forward**: Transferring unused leave to next period
- **Encashment**: Converting unused leave to monetary compensation
- **Leave Quota**: Allocated leave days per employee per year
- **Public Holiday**: Company-wide non-working days

## Requirements

### Requirement 1: Multi-type Leave Management

**User Story:** As an employee, I want to apply for different types of leave, so that I can take time off as per company policy.

#### Acceptance Criteria

1. WHEN applying for leave THEN the system SHALL support sick, casual, maternity, paternity, comp-off, and unpaid leave types
2. WHEN selecting leave type THEN the system SHALL show available balance for that type
3. WHEN leave exceeds balance THEN the system SHALL prevent submission or mark as unpaid
4. WHEN applying leave THEN the system SHALL validate against minimum notice period
5. WHEN leave overlaps THEN the system SHALL prevent duplicate applications

### Requirement 2: Leave Application and Approval Workflow

**User Story:** As a manager, I want to review and approve leave requests, so that team coverage is maintained.

#### Acceptance Criteria

1. WHEN employee applies leave THEN the system SHALL notify reporting manager
2. WHEN manager reviews THEN the system SHALL show team calendar and coverage
3. WHEN leave is approved THEN the system SHALL update leave balance and notify employee
4. WHEN leave is rejected THEN the system SHALL require reason and notify employee
5. WHEN leave is cancelled THEN the system SHALL restore leave balance

### Requirement 3: Leave Carry-forward and Encashment

**User Story:** As an HR Manager, I want to manage leave carry-forward and encashment, so that company policies are enforced.

#### Acceptance Criteria

1. WHEN year ends THEN the system SHALL calculate carry-forward leave as per policy
2. WHEN carry-forward exceeds limit THEN the system SHALL mark excess for encashment
3. WHEN processing encashment THEN the system SHALL calculate monetary value
4. WHEN encashment is approved THEN the system SHALL integrate with payroll
5. WHEN new year starts THEN the system SHALL reset leave quotas and add carry-forward

### Requirement 4: Public Holiday and Regional Calendar Management

**User Story:** As an HR Administrator, I want to manage public holidays, so that leave calculations are accurate.

#### Acceptance Criteria

1. WHEN adding holidays THEN the system SHALL support multiple regional calendars
2. WHEN employee location changes THEN the system SHALL apply relevant holiday calendar
3. WHEN holidays fall on weekends THEN the system SHALL handle compensatory offs as per policy
4. WHEN calculating leave THEN the system SHALL exclude public holidays from leave days
5. WHEN viewing calendar THEN the system SHALL show holidays for employee's location

### Requirement 5: Leave Quota and Balance Tracking

**User Story:** As an employee, I want to view my leave balance, so that I can plan my time off.

#### Acceptance Criteria

1. WHEN viewing dashboard THEN the system SHALL show current balance for all leave types
2. WHEN leave is applied THEN the system SHALL show pending approval leaves
3. WHEN leave is approved THEN the system SHALL deduct from available balance
4. WHEN generating reports THEN the system SHALL show leave utilization trends
5. WHEN quota is low THEN the system SHALL alert employee

### Requirement 6: Leave Alerts and Reminders

**User Story:** As an HR Manager, I want automated leave alerts, so that approvals are not delayed.

#### Acceptance Criteria

1. WHEN leave is applied THEN the system SHALL notify manager immediately
2. WHEN approval is pending THEN the system SHALL send reminder after 24 hours
3. WHEN leave starts soon THEN the system SHALL remind manager to approve
4. WHEN quota expires THEN the system SHALL alert employees to use leave
5. WHEN carry-forward deadline approaches THEN the system SHALL notify HR

### Requirement 7: Leave Reports and Analytics

**User Story:** As an HR Director, I want leave analytics, so that I can optimize leave policies.

#### Acceptance Criteria

1. WHEN generating reports THEN the system SHALL show leave utilization by type and department
2. WHEN analyzing trends THEN the system SHALL display seasonal leave patterns
3. WHEN reviewing costs THEN the system SHALL calculate leave liability
4. WHEN exporting data THEN the system SHALL provide reports in PDF and Excel
5. WHEN viewing dashboards THEN the system SHALL show real-time leave status

### Requirement 8: Integration with Attendance and Payroll

**User Story:** As a Payroll Administrator, I want leave data integrated, so that salary calculations are accurate.

#### Acceptance Criteria

1. WHEN processing payroll THEN the system SHALL provide approved leave days
2. WHEN unpaid leave is taken THEN the system SHALL calculate salary deduction
3. WHEN encashment is due THEN the system SHALL add to payroll
4. WHEN leave affects attendance THEN the system SHALL update attendance records
5. WHEN generating payslips THEN the system SHALL show leave summary
