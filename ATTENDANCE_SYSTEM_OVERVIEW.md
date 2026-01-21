# HRM Attendance System - Complete Overview

## 🎯 System Purpose
The HRM Attendance System is an enterprise-grade solution that tracks employee work hours, manages shifts, handles breaks, calculates overtime, and provides comprehensive reporting for payroll and HR management.

## 🏗️ System Architecture

### Core Components

#### 1. **AttendanceRecord Model** (`backend/src/models/sequelize/AttendanceRecord.js`)
- **Purpose**: Central data model for all attendance records
- **Key Features**:
  - Clock-in/Clock-out tracking
  - Break session management (JSON array)
  - Status evaluation (present, absent, half_day, leave, holiday)
  - Work hours calculation
  - Overtime tracking
  - Late arrival and early departure detection
  - Location and device tracking for security

#### 2. **AttendanceCalculationService** (`backend/src/services/core/attendanceCalculation.service.js`)
- **Purpose**: Pure calculation logic for attendance metrics
- **Key Features**:
  - Late status calculation with grace periods
  - Work hours calculation excluding breaks
  - Break session normalization
  - Overtime calculation
  - Status determination logic

#### 3. **AttendanceFinalization Job** (`backend/src/jobs/attendanceFinalization.js`)
- **Purpose**: Automated daily processing of attendance records
- **Key Features**:
  - Runs every 15 minutes to handle multiple shifts
  - Finalizes attendance after shift ends
  - Marks absent employees
  - Handles missed clock-outs
  - Sends notifications

## 🔄 How the System Works

### Daily Attendance Flow

#### **Morning - Clock In**
1. Employee opens attendance page
2. System checks if they can clock in (shift rules, holidays, leaves)
3. Captures location and device info for security
4. Records clock-in time
5. Status set to "incomplete" (waiting for clock-out)

#### **During Day - Break Management**
1. Employee can start/end breaks
2. Each break session stored with start/end times
3. System validates break rules (can't start if already on break)
4. Real-time calculation of total break time

#### **Evening - Clock Out**
1. Employee clocks out
2. System calculates total work hours minus breaks
3. Determines if late arrival or early departure
4. Calculates overtime if applicable
5. Status updated to "present", "half_day", or remains "incomplete"

#### **Night - Automatic Finalization**
1. Finalization job runs every 15 minutes
2. For each employee whose shift has ended:
   - If no clock-in: Mark as "absent"
   - If clock-in but no clock-out: Mark as "pending_correction"
   - If both exist: Calculate final status and metrics
3. Send notifications to managers and employees

### Status Types Explained

| Status | Description | When Applied |
|--------|-------------|--------------|
| **present** | Full day worked | Worked >= full day hours (default 8h) |
| **half_day** | Partial day worked | Worked >= half day hours (default 4h) but < full day |
| **absent** | No attendance | No clock-in recorded after shift ends |
| **leave** | Approved leave | Pre-approved leave application |
| **holiday** | Company holiday | System-defined or imported holidays |
| **incomplete** | Pending clock-out | Clocked in but not out (during shift) |
| **pending_correction** | Needs HR review | Missed clock-out or other issues |

## 🛠️ Key Features

### 1. **Multi-Shift Support**
- Different shifts (morning, evening, night)
- Flexible shift timings per employee
- Grace periods for late arrivals
- Shift-specific overtime rules

### 2. **Break Management**
- Multiple breaks per day
- Automatic break time calculation
- Break sessions stored as JSON array
- Prevents overtime fraud from long breaks

### 3. **Smart Status Evaluation**
- Rule-based status determination
- Considers shift timings and work hours
- Handles edge cases (very short work periods)
- Protected statuses (leave/holiday can't be overridden)

### 4. **Security Features**
- Location tracking for clock-in/out
- Device information capture
- IP address logging
- Prevents duplicate clock-ins

### 5. **Correction System**
- Employees can request corrections
- Admin approval workflow
- Audit trail for all changes
- Prevents duplicate correction requests

### 6. **Real-time Monitoring**
- Live attendance dashboard for admins
- Current status of all employees
- Break tracking with duration
- Shift progress indicators

## 📊 Reporting & Analytics

### Employee Reports
- Monthly attendance summary
- Work hours breakdown
- Late arrivals and early departures
- Break time analysis
- Leave balance integration

### Admin Reports
- Department-wise attendance
- Overtime analysis
- Attendance trends
- Compliance reporting
- Payroll integration data

## 🔧 Technical Implementation

### Database Structure
```sql
attendance_records:
- id, employeeId, shiftId, date
- clockIn, clockOut
- breakSessions (JSON)
- totalWorkedMinutes, workHours
- status, statusReason
- lateMinutes, overtimeMinutes
- location, deviceInfo
- correction fields
```

### API Endpoints
- `POST /api/employee/attendance/clock-in` - Clock in
- `POST /api/employee/attendance/clock-out` - Clock out
- `POST /api/employee/attendance/start-break` - Start break
- `POST /api/employee/attendance/end-break` - End break
- `GET /api/employee/attendance/status` - Current status
- `GET /api/employee/attendance/monthly` - Monthly summary

### Frontend Components
- **AttendancePage**: Main employee interface
- **EnhancedClockInOut**: Clock-in/out widget
- **AttendanceSummary**: Monthly statistics
- **LiveAttendanceDashboard**: Admin monitoring
- **AttendanceCorrections**: Admin correction management

## 🚀 Recent Critical Fixes Applied

### AttendanceCalculationService Fixes
1. **Late Minutes Calculation**: Now correctly calculates after grace period
2. **Work Hours Units**: Consistent minute-based calculations
3. **Duplicate Logic Removal**: Single source of truth for button states
4. **Negative Time Guards**: Prevents invalid negative durations
5. **Overtime Calculation**: Added proper overtime logic

### AttendanceRecord Model Fixes
1. **Break Session Recalculation**: Always recalculates from source data
2. **Integer-based Logic**: Eliminates floating-point precision issues
3. **Overtime Based on Work Time**: Prevents fraud from long breaks
4. **Performance Optimization**: Removed N+1 queries from hooks
5. **Data Integrity**: Added unique constraints for corrections
6. **Status Evaluation**: Improved rule engine for accurate status

## 📋 Business Rules

### Attendance Rules
- **Grace Period**: Configurable late arrival tolerance (default 10 min)
- **Full Day**: Minimum hours for full day status (default 8 hours)
- **Half Day**: Minimum hours for half day status (default 4 hours)
- **Overtime Threshold**: Hours after which overtime applies
- **Break Limits**: Maximum break time per day

### Validation Rules
- Can't clock in if already clocked in
- Can't clock out without clock in
- Can't start break if already on break
- Can't clock in on holidays or approved leaves
- Location validation for remote work policies

### Finalization Rules
- Records finalized only after shift ends
- Absent marking only after grace period expires
- Overtime calculated on actual worked time
- Status protected for leaves and holidays

## 🔮 Integration Points

### Calendar System
- Holiday integration via Calendarific API
- Leave management integration
- Shift scheduling coordination
- Weekend and working day rules

### Payroll System
- Work hours export
- Overtime calculations
- Late deduction calculations
- Monthly summaries for salary processing

### Notification System
- Real-time attendance alerts
- Missed clock-out notifications
- Overtime threshold alerts
- Correction request notifications

## 📈 Performance Features

### Optimization
- Efficient database queries
- Cached calculations
- Bulk processing for finalization
- Indexed database fields

### Scalability
- Supports multiple shifts simultaneously
- Handles large employee bases
- Efficient monthly summary calculations
- Real-time updates without performance impact

## 🛡️ Security & Compliance

### Data Security
- Location-based validation
- Device fingerprinting
- IP address tracking
- Audit trail for all changes

### Compliance
- Labor law compliance features
- Overtime regulation adherence
- Break time tracking
- Working hours monitoring

This attendance system provides a comprehensive, secure, and scalable solution for enterprise workforce management with accurate payroll integration and robust reporting capabilities.