# 📁 Frontend Structure Analysis & Recommendations

**Analysis Date**: December 26, 2025  
**Status**: Comprehensive Review of All Modules

---

## 🎯 CURRENT FRONTEND STRUCTURE OVERVIEW

### Current Module Organization:
```
frontend/src/modules/
├── admin/                    (Admin pages only - NEEDS RESTRUCTURE)
│   ├── pages/
│   └── services/
├── attendance/               (Good structure)
│   ├── admin/
│   ├── employee/
│   ├── calendar/
│   ├── components/
│   ├── pages/
│   └── services/
├── auth/
├── calendar/
├── employee/                 (Mixed structure - NEEDS CLEANUP)
│   ├── profile/
│   ├── pages/
│   └── services/
├── employees/                (Employee management - INCOMPLETE)
│   ├── pages/
│   └── components/
├── ess/                      (Bank details - ISOLATED)
│   └── bank/
├── leads/                    (Good structure)
│   ├── pages/
│   ├── components/
│   └── [MISSING services/]
├── leave/                    (Well structured)
│   ├── employee/
│   ├── hr/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── services/
├── notifications/
└── organization/             (Organization management)
    ├── admin/
    ├── pages/
    └── [MISSING services/]
```

---

## ✅ FEATURE 1: PROFILE & BANK DETAILS MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/employee/profile/ProfilePage.jsx
✅ frontend/src/modules/ess/bank/BankDetailsPage.jsx
✅ frontend/src/modules/employees/pages/EmployeeProfile.jsx (Admin)
✅ frontend/src/modules/employees/useEmployeeSelfService.js (Hook)
✅ frontend/src/services/employeeSelfService.js (Service)
```

### Status: **🟢 GOOD - 90% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| ProfilePage.jsx | ✅ Complete | Fully implemented, uses hooks correctly |
| BankDetailsPage.jsx | ✅ Complete | Fully implemented |
| EmployeeProfile.jsx | ✅ Complete | Admin view implemented |
| useEmployeeSelfService.js | ✅ Complete | Custom hook for profile/bank |
| employeeSelfService.js | ✅ Complete | API service methods |

### ⚠️ Issues Found:
- [ ] Profile photo upload handler needs testing
- [ ] Document download functionality needs verification
- [ ] Bank details verification workflow (admin approval) missing

### 📋 TODO:
- [ ] Create `frontend/src/modules/employee/profile/services/profileService.js` (separate service)
- [ ] Create `frontend/src/modules/employee/profile/hooks/` directory for profile-specific hooks
- [ ] Add profile validation schema file

---

## ⏱️ FEATURE 2: ATTENDANCE MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/attendance/employee/AttendancePage.jsx
✅ frontend/src/modules/attendance/admin/AttendanceAdminList.jsx
✅ frontend/src/modules/attendance/admin/AttendanceCorrections.jsx
✅ frontend/src/modules/attendance/admin/ShiftManagement.jsx
✅ frontend/src/modules/attendance/services/attendanceService.js
❌ frontend/src/modules/attendance/hooks/ (MISSING)
❌ frontend/src/modules/attendance/admin/services/ (MISSING)
⚠️ frontend/src/modules/attendance/components/ (NEEDS ORGANIZATION)
```

### Status: **🟡 PARTIAL - 60% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| AttendancePage.jsx | ✅ Complete | Employee attendance page ready |
| AttendanceAdminList.jsx | ⚠️ Partial | Needs data binding to API |
| AttendanceCorrections.jsx | ⚠️ Partial | Form incomplete, needs workflow |
| ShiftManagement.jsx | ⚠️ Partial | CRUD forms missing |
| attendanceService.js | ⚠️ Partial | Only has basic endpoints |
| ClockInOut Components | ⚠️ Partial | Components exist but need integration |

### ❌ Missing Files (MUST CREATE):

```
frontend/src/modules/attendance/
├── hooks/
│   ├── useAttendance.js              [MISSING]
│   ├── useShift.js                   [MISSING]
│   └── useAttendanceCorrection.js    [MISSING]
├── admin/
│   ├── services/
│   │   ├── shiftService.js           [MISSING]
│   │   └── attendanceCorrectionService.js [MISSING]
│   └── components/
│       ├── AttendanceDateFilter.jsx  [MISSING]
│       ├── AttendanceStats.jsx       [MISSING]
│       ├── ShiftForm.jsx (move here)
│       ├── AttendanceCorrectionForm.jsx [MISSING]
│       └── LateArrivalRules.jsx      [MISSING]
└── employee/
    ├── components/
    │   ├── BreakTracker.jsx          [MISSING]
    │   ├── AttendanceHistory.jsx     [MISSING]
    │   └── WorkingHours.jsx          [MISSING]
    └── hooks/
        └── useClock.js               [MISSING]
```

### 📋 TODO (Priority: HIGH):

1. **Create Admin Hooks**:
   - `useAttendance.js` - for attendance CRUD
   - `useShift.js` - for shift management
   - `useAttendanceCorrection.js` - for correction requests

2. **Create Admin Services**:
   - `shiftService.js` - shift API calls
   - `attendanceCorrectionService.js` - correction API calls

3. **Create Missing Components**:
   - `AttendanceDateFilter.jsx` - filter by date
   - `AttendanceStats.jsx` - stats dashboard
   - `AttendanceCorrectionForm.jsx` - correction form
   - `BreakTracker.jsx` - break tracking UI
   - `LateArrivalRules.jsx` - grace period config

4. **Complete Forms**:
   - ShiftManagement.jsx - Add create/edit forms
   - AttendanceCorrections.jsx - Complete correction workflow

5. **Data Integration**:
   - Wire all components to API endpoints
   - Add real-time updates for clock in/out

---

## 📅 FEATURE 3: LEAVE MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/leave/employee/LeavePage.jsx
✅ frontend/src/modules/leave/hr/LeaveManagement.jsx
✅ frontend/src/modules/admin/pages/LeaveBalancesPage.jsx
✅ frontend/src/modules/leave/components/ (Multiple components)
✅ frontend/src/modules/leave/services/leaveService.js
✅ frontend/src/modules/leave/hooks/useLeaveBalance.js
```

### Status: **🟢 GOOD - 85% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| LeavePage.jsx | ✅ Complete | Fully implemented |
| LeaveManagement.jsx | ✅ Complete | HR approval workflow |
| LeaveBalancesPage.jsx | ⚠️ Partial | Admin form incomplete |
| LeaveRequestModal.jsx | ✅ Complete | Modal for new requests |
| leaveService.js | ✅ Complete | All endpoints covered |
| useLeaveBalance.js | ✅ Complete | Custom hook working |

### ⚠️ Issues Found:
- [ ] LeaveBalancesPage form incomplete (assign balance UI)
- [ ] Leave policy configuration missing
- [ ] Bulk leave assignment form missing
- [ ] Carryover calculation UI missing

### 📋 TODO (Priority: MEDIUM):

1. **Complete LeaveBalancesPage.jsx**:
   - Add balance assignment form
   - Add bulk assignment feature
   - Add adjustment workflow

2. **Create Missing Components**:
   ```
   frontend/src/modules/leave/
   ├── admin/
   │   ├── services/
   │   │   └── leaveBalanceService.js        [MISSING]
   │   └── components/
   │       ├── LeaveAssignmentForm.jsx       [MISSING]
   │       ├── BulkLeaveAssignment.jsx       [MISSING]
   │       └── LeaveBalanceAdjustment.jsx    [MISSING]
   └── policies/
       ├── LeavePolicyConfig.jsx             [MISSING]
       └── LeaveTypeConfig.jsx               [MISSING]
   ```

3. **Create Services**:
   - `leaveBalanceService.js` - balance management API

4. **Enhancement**:
   - Add leave year configuration
   - Add carryover calculation
   - Add export functionality

---

## 👥 FEATURE 4: EMPLOYEE MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/employees/pages/EmployeeList.jsx
⚠️ frontend/src/modules/employees/pages/EmployeeForm.jsx (Partial)
✅ frontend/src/modules/employees/pages/EmployeeProfile.jsx
⚠️ frontend/src/modules/admin/pages/DepartmentsPage.jsx (Standalone)
⚠️ frontend/src/modules/admin/pages/DesignationsPage.jsx (Standalone)
❌ frontend/src/modules/employees/services/ (MISSING)
❌ frontend/src/modules/employees/hooks/ (MISSING)
```

### Status: **🟡 PARTIAL - 50% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| EmployeeList.jsx | ✅ Complete | List with filters |
| EmployeeForm.jsx | ⚠️ Partial | Create form incomplete |
| EmployeeProfile.jsx | ✅ Complete | View profile only |
| DepartmentsPage.jsx | ⚠️ Partial | Create/edit forms incomplete |
| DesignationsPage.jsx | ⚠️ Partial | Create/edit forms incomplete |

### ❌ STRUCTURAL ISSUES (NEEDS REORGANIZATION):

**Current Problem**: 
- DepartmentsPage.jsx and DesignationsPage.jsx are in `/admin/pages/` but should be in `/modules/organization/`
- No services or hooks for employee management

### 📋 TODO (Priority: HIGH - RESTRUCTURING NEEDED):

1. **RESTRUCTURE - Move files**:
   ```
   FROM: frontend/src/modules/admin/pages/DepartmentsPage.jsx
   TO:   frontend/src/modules/organization/pages/DepartmentsPage.jsx
   
   FROM: frontend/src/modules/admin/pages/DesignationsPage.jsx
   TO:   frontend/src/modules/organization/pages/DesignationsPage.jsx
   ```

2. **Create Employee Services**:
   ```
   frontend/src/modules/employees/
   ├── services/
   │   ├── employeeService.js              [CREATE]
   │   ├── departmentService.js            [CREATE]
   │   └── designationService.js           [CREATE]
   └── hooks/
       ├── useEmployee.js                  [CREATE]
       ├── useDepartment.js                [CREATE]
       └── useDesignation.js               [CREATE]
   ```

3. **Complete Missing Forms**:
   - EmployeeForm.jsx - Add all fields
   - DepartmentsPage.jsx - Add create/edit/delete
   - DesignationsPage.jsx - Add create/edit/delete

4. **Create Missing Components**:
   ```
   frontend/src/modules/employees/components/
   ├── EmployeeCard.jsx                    [EXISTS - verify]
   ├── EmployeeTable.jsx                   [EXISTS - verify]
   ├── EmployeeFormFields.jsx              [CREATE]
   ├── DepartmentHierarchy.jsx             [CREATE]
   └── BulkEmployeeImport.jsx              [CREATE]
   ```

---

## 📌 FEATURE 5: LEAD MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/leads/pages/LeadManagement.jsx
⚠️ frontend/src/modules/leads/components/ (3 files)
❌ frontend/src/modules/leads/services/ (MISSING)
❌ frontend/src/modules/leads/hooks/ (MISSING)
❌ frontend/src/modules/leads/employee/ (MISSING)
```

### Status: **🟡 PARTIAL - 55% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| LeadManagement.jsx | ⚠️ Partial | HR/Admin view, forms incomplete |
| LeadForm.jsx | ⚠️ Partial | Component exists but incomplete |
| LeadDetails.jsx | ⚠️ Partial | View only |
| leadService.js | ❌ MISSING | No service file |

### ❌ Missing Files (MUST CREATE):

```
frontend/src/modules/leads/
├── services/
│   └── leadService.js                  [MISSING - CREATE]
├── hooks/
│   └── useLead.js                      [MISSING - CREATE]
├── employee/
│   ├── pages/
│   │   └── MyLeadsPage.jsx            [MISSING - CREATE]
│   └── components/
│       ├── LeadCard.jsx               [MISSING - CREATE]
│       └── LeadStatusUpdate.jsx       [MISSING - CREATE]
└── admin/
    └── components/
        ├── LeadFilters.jsx            [MISSING - CREATE]
        ├── LeadStats.jsx              [MISSING - CREATE]
        └── BulkLeadAssignment.jsx     [MISSING - CREATE]
```

### 📋 TODO (Priority: HIGH):

1. **Create Service Layer**:
   - `leadService.js` - API calls for leads

2. **Create Custom Hook**:
   - `useLead.js` - lead state management

3. **Create Employee Lead View**:
   - `MyLeadsPage.jsx` - Employee assigned leads
   - `LeadCard.jsx` - Card component
   - `LeadStatusUpdate.jsx` - Status update UI

4. **Complete Admin Features**:
   - Lead creation form
   - Bulk lead assignment
   - Lead filters
   - Lead stats dashboard

5. **Complete Components**:
   - LeadForm.jsx - Full form implementation
   - LeadDetails.jsx - Full details view
   - Add notes/comments system

---

## 🔄 FEATURE 6: SHIFT MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/attendance/admin/ShiftManagement.jsx
⚠️ frontend/src/modules/attendance/admin/ShiftForm.jsx (Standalone)
⚠️ frontend/src/modules/employee/pages/ShiftsPage.jsx (Employee view)
⚠️ frontend/src/modules/attendance/admin/ShiftDetails.jsx
❌ frontend/src/modules/attendance/admin/services/ (MISSING)
❌ frontend/src/modules/attendance/hooks/useShift.js (MISSING)
❌ frontend/src/modules/attendance/employee/hooks/useMyShift.js (MISSING)
```

### Status: **🟡 PARTIAL - 45% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| ShiftManagement.jsx | ⚠️ Partial | Admin page, forms incomplete |
| ShiftForm.jsx | ⚠️ Partial | Component exists, needs completion |
| ShiftsPage.jsx | ⚠️ Partial | Employee view needs API binding |
| ShiftDetails.jsx | ⚠️ Partial | View component |

### ❌ Missing Files (MUST CREATE):

```
frontend/src/modules/attendance/
├── admin/
│   ├── services/
│   │   └── shiftService.js             [MISSING - CREATE]
│   └── components/
│       ├── ShiftFilters.jsx            [MISSING - CREATE]
│       ├── ShiftAssignmentForm.jsx     [MISSING - CREATE]
│       ├── BulkShiftAssignment.jsx     [MISSING - CREATE]
│       └── ShiftRulesConfig.jsx        [MISSING - CREATE]
├── hooks/
│   └── useShift.js                     [MISSING - CREATE]
└── employee/
    ├── hooks/
    │   └── useMyShift.js               [MISSING - CREATE]
    └── components/
        ├── MyShiftCard.jsx             [MISSING - CREATE]
        ├── ShiftChangeRequest.jsx      [MISSING - CREATE]
        └── ShiftScheduleCalendar.jsx   [MISSING - CREATE]
```

### 📋 TODO (Priority: HIGH):

1. **Create Service Layer**:
   - `shiftService.js` - Shift API calls

2. **Create Hooks**:
   - `useShift.js` - Admin shift management
   - `useMyShift.js` - Employee shift view

3. **Complete Admin Features**:
   - ShiftForm.jsx - Complete form
   - ShiftAssignmentForm.jsx - Assign shifts
   - BulkShiftAssignment.jsx - Bulk operations
   - ShiftRulesConfig.jsx - Grace period, breaks

4. **Complete Employee Features**:
   - ShiftsPage.jsx - Wire to API
   - ShiftChangeRequest.jsx - Change request form
   - ShiftScheduleCalendar.jsx - Calendar view

5. **Enhancement**:
   - Add shift rule configuration
   - Add grace period settings
   - Add break duration rules

---

## 📆 FEATURE 7: CALENDAR, EVENT & HOLIDAY MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/admin/pages/EventsPage.jsx
⚠️ frontend/src/modules/admin/pages/Holidays/HolidaysPage.jsx
⚠️ frontend/src/modules/employee/pages/CalendarPage.jsx
✅ frontend/src/modules/attendance/calendar/ (Multiple)
❌ frontend/src/modules/admin/services/ (MISSING for events/holidays)
❌ frontend/src/modules/calendar/hooks/ (MISSING)
```

### Status: **🟡 PARTIAL - 60% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| EventsPage.jsx | ⚠️ Partial | Create/edit forms incomplete |
| HolidaysPage.jsx | ⚠️ Partial | Forms incomplete |
| CalendarPage.jsx | ⚠️ Partial | View only, API not connected |

### ❌ Missing Files (MUST CREATE):

```
frontend/src/modules/calendar/
├── services/
│   ├── eventService.js                 [MISSING - CREATE]
│   ├── holidayService.js               [MISSING - CREATE]
│   └── calendarService.js              [MISSING - CREATE]
├── hooks/
│   ├── useEvent.js                     [MISSING - CREATE]
│   ├── useHoliday.js                   [MISSING - CREATE]
│   └── useCalendar.js                  [MISSING - CREATE]
├── admin/
│   ├── pages/
│   │   ├── EventsPage.jsx              [MOVE from admin/pages/]
│   │   └── HolidaysPage.jsx            [MOVE from admin/pages/]
│   └── components/
│       ├── EventForm.jsx               [MISSING - CREATE]
│       ├── HolidayForm.jsx             [MISSING - CREATE]
│       └── CalendarTypeSelector.jsx    [MISSING - CREATE]
└── employee/
    ├── pages/
    │   └── CalendarPage.jsx            [MOVE from employee/pages/]
    └── components/
        ├── HolidayList.jsx             [MISSING - CREATE]
        ├── EventReminders.jsx          [MISSING - CREATE]
        └── AnnouncementPanel.jsx       [MISSING - CREATE]
```

### 📋 TODO (Priority: MEDIUM):

1. **Reorganize Structure**:
   - Move EventsPage.jsx to `calendar/admin/pages/`
   - Move HolidaysPage.jsx to `calendar/admin/pages/`
   - Move CalendarPage.jsx to `calendar/employee/pages/`

2. **Create Service Layer**:
   - `eventService.js` - Event API calls
   - `holidayService.js` - Holiday API calls
   - `calendarService.js` - Calendar utility service

3. **Create Hooks**:
   - `useEvent.js` - Event management
   - `useHoliday.js` - Holiday management
   - `useCalendar.js` - Calendar state

4. **Create Forms & Components**:
   - EventForm.jsx - Event creation/editing
   - HolidayForm.jsx - Holiday creation/editing
   - HolidayList.jsx - Holiday listing
   - EventReminders.jsx - Reminder notifications

5. **Enhancement**:
   - Wire CalendarPage to API
   - Add event filtering
   - Add holiday type configuration
   - Add event category management

---

## 🔐 FEATURE 8: AUDIT LOG MANAGEMENT

### Current Files:
```
✅ frontend/src/modules/admin/pages/Dashboard/AuditLogsPage.jsx
❌ frontend/src/modules/admin/services/ (MISSING for audit)
❌ frontend/src/modules/admin/hooks/ (MISSING)
```

### Status: **🟡 PARTIAL - 30% COMPLETE**

| File | Status | Notes |
|------|--------|-------|
| AuditLogsPage.jsx | ⚠️ Partial | UI exists but API not connected |

### ❌ Missing Files (MUST CREATE):

```
frontend/src/modules/admin/
├── pages/
│   └── AuditLogsPage.jsx               [EXISTS - needs API]
├── services/
│   └── auditLogService.js              [MISSING - CREATE]
└── hooks/
    └── useAuditLog.js                  [MISSING - CREATE]

OR better structure:

frontend/src/modules/audit/
├── pages/
│   └── AuditLogsPage.jsx               [MOVE here]
├── services/
│   └── auditLogService.js              [CREATE]
├── hooks/
│   └── useAuditLog.js                  [CREATE]
└── components/
    ├── AuditLogFilters.jsx             [CREATE]
    ├── AuditLogTable.jsx               [CREATE]
    └── AuditLogExport.jsx              [CREATE]
```

### 📋 TODO (Priority: MEDIUM):

1. **Reorganize (Optional)**:
   - Create separate `audit` module
   - Move AuditLogsPage.jsx to `audit/pages/`

2. **Create Service Layer**:
   - `auditLogService.js` - Audit log API

3. **Create Hook**:
   - `useAuditLog.js` - Audit log state

4. **Create Components**:
   - `AuditLogFilters.jsx` - Filter UI
   - `AuditLogTable.jsx` - Table display
   - `AuditLogExport.jsx` - Export functionality

5. **Wire to API**:
   - Connect AuditLogsPage to API
   - Add filtering by user/module/date/action
   - Add export CSV/PDF

---

## 🎛️ ADDITIONAL FEATURES

### Admin Dashboard
```
✅ frontend/src/modules/admin/pages/Dashboard/AdminDashboard.jsx
✅ frontend/src/modules/admin/pages/Dashboard/AnnouncementsPage.jsx
❌ frontend/src/modules/admin/services/ (MISSING)
❌ frontend/src/modules/admin/hooks/ (MISSING)
```
**Status**: 🟡 Partial - UI exists, API integration needed

### Employee Dashboard
```
✅ frontend/src/modules/employee/pages/Dashboard/EmployeeDashboard.jsx
✅ frontend/src/modules/employee/pages/Dashboard/APITester.jsx
```
**Status**: ✅ Good - Basic functionality exists

### Notifications
```
✅ frontend/src/modules/notifications/pages/NotificationsPage.jsx
❌ frontend/src/modules/notifications/services/ (MISSING)
❌ frontend/src/modules/notifications/hooks/ (MISSING)
```
**Status**: 🟡 Partial - UI complete, API integration needed

### Organization Management
```
⚠️ frontend/src/modules/organization/pages/DepartmentPage.jsx
⚠️ frontend/src/modules/organization/pages/DesignationPage.jsx
⚠️ frontend/src/modules/organization/pages/HolidayPage.jsx
⚠️ frontend/src/modules/organization/pages/PolicyPage.jsx
⚠️ frontend/src/modules/organization/pages/CompanyDocumentsPage.jsx
❌ frontend/src/modules/organization/services/ (MISSING)
```
**Status**: 🟡 Partial - Pages exist, need cleanup and services

---

## 📊 SUMMARY OF CHANGES NEEDED

### 🟢 COMPLETE (No changes needed):
1. ✅ Profile & Bank Details - 90% done
2. ✅ Leave Management - 85% done

### 🟡 PARTIAL (Needs completion):
3. ⚠️ Attendance - 60% done → **HIGH PRIORITY**
4. ⚠️ Employee Management - 50% done → **HIGH PRIORITY**
5. ⚠️ Lead Management - 55% done → **HIGH PRIORITY**
6. ⚠️ Shift Management - 45% done → **HIGH PRIORITY**
7. ⚠️ Calendar & Events - 60% done → **MEDIUM PRIORITY**
8. ⚠️ Audit Logs - 30% done → **MEDIUM PRIORITY**

### ❌ CRITICAL FILES TO CREATE (30+ files):

**Services** (13 files):
- `attendance/admin/services/shiftService.js`
- `attendance/admin/services/attendanceCorrectionService.js`
- `leads/services/leadService.js`
- `leads/admin/services/leadAssignmentService.js`
- `calendar/services/eventService.js`
- `calendar/services/holidayService.js`
- `calendar/services/calendarService.js`
- `admin/services/auditLogService.js`
- `admin/services/adminDashboardService.js`
- `admin/services/announcementService.js`
- `notifications/services/notificationService.js`
- `organization/services/organizationService.js`
- `employees/services/employeeService.js`

**Hooks** (13 files):
- `attendance/hooks/useAttendance.js`
- `attendance/hooks/useShift.js`
- `attendance/hooks/useAttendanceCorrection.js`
- `attendance/employee/hooks/useClock.js`
- `leads/hooks/useLead.js`
- `calendar/hooks/useEvent.js`
- `calendar/hooks/useHoliday.js`
- `calendar/hooks/useCalendar.js`
- `admin/hooks/useAuditLog.js`
- `admin/hooks/useAnnouncement.js`
- `notifications/hooks/useNotification.js`
- `organization/hooks/useDepartment.js`
- `organization/hooks/useDesignation.js`

**Components** (15+ files):
- `attendance/admin/components/AttendanceDateFilter.jsx`
- `attendance/admin/components/AttendanceStats.jsx`
- `attendance/admin/components/AttendanceCorrectionForm.jsx`
- `attendance/admin/components/ShiftForm.jsx`
- `attendance/admin/components/LateArrivalRules.jsx`
- `attendance/employee/components/BreakTracker.jsx`
- `attendance/employee/components/AttendanceHistory.jsx`
- `leads/employee/pages/MyLeadsPage.jsx`
- `leads/admin/components/LeadFilters.jsx`
- `leads/admin/components/LeadStats.jsx`
- And more...

### 🔄 FILES TO REORGANIZE (Move/Rename):

1. **DepartmentsPage.jsx**:
   - FROM: `/admin/pages/DepartmentsPage.jsx`
   - TO: `/organization/pages/DepartmentsPage.jsx` OR `/employees/pages/DepartmentsPage.jsx`

2. **DesignationsPage.jsx**:
   - FROM: `/admin/pages/DesignationsPage.jsx`
   - TO: `/organization/pages/DesignationsPage.jsx` OR `/employees/pages/DesignationsPage.jsx`

3. **EventsPage.jsx & HolidaysPage.jsx**:
   - FROM: `/admin/pages/`
   - TO: `/calendar/admin/pages/`

4. **CalendarPage.jsx**:
   - FROM: `/employee/pages/CalendarPage.jsx`
   - TO: `/calendar/employee/pages/CalendarPage.jsx`

5. **AuditLogsPage.jsx**:
   - FROM: `/admin/pages/Dashboard/AuditLogsPage.jsx`
   - TO: `/audit/pages/AuditLogsPage.jsx` (NEW MODULE)

---

## 🎯 RECOMMENDED FINAL STRUCTURE

```
frontend/src/modules/
├── attendance/
│   ├── admin/
│   │   ├── pages/
│   │   │   ├── AttendanceAdminList.jsx
│   │   │   ├── AttendanceCorrections.jsx
│   │   │   └── ShiftManagement.jsx
│   │   ├── services/
│   │   │   ├── shiftService.js          [NEW]
│   │   │   └── attendanceCorrectionService.js [NEW]
│   │   └── components/
│   │       ├── AttendanceDateFilter.jsx
│   │       ├── AttendanceStats.jsx
│   │       ├── ShiftForm.jsx
│   │       └── ShiftAssignmentForm.jsx
│   ├── employee/
│   │   ├── pages/
│   │   │   └── AttendancePage.jsx
│   │   ├── components/
│   │   │   ├── ClockInOut.jsx
│   │   │   ├── BreakTracker.jsx
│   │   │   └── AttendanceHistory.jsx
│   │   └── hooks/
│   │       └── useClock.js              [NEW]
│   ├── calendar/
│   │   ├── UnifiedCalendar.jsx
│   │   └── AttendanceCalendar.jsx
│   ├── services/
│   │   └── attendanceService.js
│   └── hooks/
│       ├── useAttendance.js             [NEW]
│       └── useShift.js                  [NEW]
│
├── calendar/                            [NEW MODULE]
│   ├── admin/
│   │   ├── pages/
│   │   │   ├── EventsPage.jsx           [MOVED]
│   │   │   └── HolidaysPage.jsx         [MOVED]
│   │   ├── services/
│   │   │   ├── eventService.js          [NEW]
│   │   │   └── holidayService.js        [NEW]
│   │   └── components/
│   │       ├── EventForm.jsx            [NEW]
│   │       └── HolidayForm.jsx          [NEW]
│   ├── employee/
│   │   ├── pages/
│   │   │   └── CalendarPage.jsx         [MOVED]
│   │   └── components/
│   │       ├── HolidayList.jsx          [NEW]
│   │       └── EventReminders.jsx       [NEW]
│   ├── services/
│   │   └── calendarService.js           [NEW]
│   └── hooks/
│       ├── useEvent.js                  [NEW]
│       ├── useHoliday.js                [NEW]
│       └── useCalendar.js               [NEW]
│
├── employees/
│   ├── pages/
│   │   ├── EmployeeList.jsx
│   │   ├── EmployeeForm.jsx
│   │   ├── EmployeeProfile.jsx
│   │   ├── DepartmentsPage.jsx          [MOVED]
│   │   └── DesignationsPage.jsx         [MOVED]
│   ├── services/
│   │   ├── employeeService.js           [NEW]
│   │   ├── departmentService.js         [NEW]
│   │   └── designationService.js        [NEW]
│   ├── hooks/
│   │   ├── useEmployee.js               [NEW]
│   │   ├── useDepartment.js             [NEW]
│   │   └── useDesignation.js            [NEW]
│   └── components/
│       ├── EmployeeCard.jsx
│       ├── EmployeeTable.jsx
│       └── EmployeeFormFields.jsx       [NEW]
│
├── leads/
│   ├── pages/
│   │   ├── LeadManagement.jsx           (HR/Admin)
│   │   └── MyLeadsPage.jsx              [NEW] (Employee)
│   ├── services/
│   │   └── leadService.js               [NEW]
│   ├── hooks/
│   │   └── useLead.js                   [NEW]
│   ├── admin/
│   │   └── components/
│   │       ├── LeadForm.jsx
│   │       ├── LeadFilters.jsx          [NEW]
│   │       └── BulkLeadAssignment.jsx   [NEW]
│   ├── employee/
│   │   └── components/
│   │       ├── LeadCard.jsx             [NEW]
│   │       └── LeadStatusUpdate.jsx     [NEW]
│   └── components/
│       ├── LeadDetails.jsx
│       └── NoteForm.jsx
│
├── leave/
│   ├── employee/
│   │   ├── pages/
│   │   │   └── LeavePage.jsx
│   │   └── components/
│   │       ├── LeaveRequestModal.jsx
│   │       └── LeaveBalanceCard.jsx
│   ├── hr/
│   │   ├── pages/
│   │   │   └── LeaveManagement.jsx
│   │   └── components/
│   │       └── LeaveApprovalForm.jsx
│   ├── admin/
│   │   ├── pages/
│   │   │   └── LeaveBalancesPage.jsx
│   │   ├── services/
│   │   │   └── leaveBalanceService.js   [NEW]
│   │   └── components/
│   │       ├── LeaveAssignmentForm.jsx  [NEW]
│   │       └── BulkLeaveAssignment.jsx  [NEW]
│   ├── services/
│   │   └── leaveService.js
│   └── hooks/
│       └── useLeaveBalance.js
│
├── audit/                               [NEW MODULE]
│   ├── pages/
│   │   └── AuditLogsPage.jsx            [MOVED]
│   ├── services/
│   │   └── auditLogService.js           [NEW]
│   ├── hooks/
│   │   └── useAuditLog.js               [NEW]
│   └── components/
│       ├── AuditLogFilters.jsx          [NEW]
│       └── AuditLogExport.jsx           [NEW]
│
├── admin/
│   ├── pages/
│   │   └── Dashboard/
│   │       ├── AdminDashboard.jsx
│   │       └── AnnouncementsPage.jsx
│   └── services/
│       ├── adminDashboardService.js     [NEW]
│       └── announcementService.js       [NEW]
│
├── employee/
│   ├── profile/
│   │   ├── ProfilePage.jsx
│   │   └── services/
│   │       └── profileService.js        [NEW]
│   ├── pages/
│   │   └── Dashboard/
│   │       ├── EmployeeDashboard.jsx
│   │       └── SettingsPage.jsx
│   └── services/
│       └── employeeService.js
│
├── notifications/
│   ├── pages/
│   │   └── NotificationsPage.jsx
│   ├── services/
│   │   └── notificationService.js       [NEW]
│   └── hooks/
│       └── useNotification.js           [NEW]
│
├── organization/
│   ├── pages/
│   │   ├── CompanyDocumentsPage.jsx
│   │   ├── PolicyPage.jsx
│   │   └── admin/
│   │       ├── UserManagement.jsx
│   │       └── SystemConfig.jsx
│   ├── services/
│   │   └── organizationService.js       [NEW]
│   └── hooks/
│       └── useOrganization.js           [NEW]
│
├── ess/
│   └── bank/
│       └── BankDetailsPage.jsx
│
└── auth/
```

---

## ⚠️ CRITICAL ACTION ITEMS (In Order of Priority)

### **PHASE 1: CRITICAL STRUCTURE** (This week)
- [ ] Create all missing service files (13 files)
- [ ] Create all missing hook files (13 files)
- [ ] Reorganize departments/designations to proper module
- [ ] Create `audit` module and move AuditLogsPage

### **PHASE 2: HIGH PRIORITY COMPONENTS** (Next week)
- [ ] Complete Attendance admin forms and components
- [ ] Complete Employee management forms
- [ ] Complete Lead management pages and forms
- [ ] Complete Shift management forms

### **PHASE 3: MEDIUM PRIORITY** (Following week)
- [ ] Complete Calendar/Events/Holidays
- [ ] Create all missing helper components
- [ ] Wire all pages to API endpoints

### **PHASE 4: ENHANCEMENTS** (Polish)
- [ ] Add validation schemas
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add form validation

---

**Generated**: December 26, 2025  
**Analysis Type**: Complete Frontend Structure Review  
**Next Steps**: Begin Phase 1 implementation
