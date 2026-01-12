# 📅 Calendar Architecture Improvements

## Overview
This document outlines the architectural improvements made to the HRM Calendar system based on enterprise best practices and clear separation of concerns.

## ✅ What Was Already Correct

Your original design was fundamentally sound:

- **Clear Model Separation**: CompanyEvent ≠ Holiday ≠ WorkingRule
- **Proper Domain Logic**: Events don't affect payroll, holidays do
- **Smart Recurring Holidays**: Dynamic generation without data duplication
- **Rich Event Metadata**: Priority, color, access control, recurrence
- **Working Rule History**: Time-based rules with effective dates

## 🔧 Improvements Made

### 1️⃣ **Model Enhancements**

#### CompanyEvent Model
```javascript
// Added
blocksWorkingDay: Boolean // For company offsites, mandatory training, emergency shutdowns

// Removed from eventType enum
'birthday', 'anniversary' // These are now generated events only
```

#### Holiday Model
```javascript
// Added HR Decision Fields
hrApprovalStatus: ENUM('pending', 'approved', 'rejected')
visibleToEmployees: Boolean
includeInPayroll: Boolean
locationScope: ENUM('GLOBAL', 'STATE', 'CITY') // For India state-specific holidays
```

#### WorkingRule Model
```javascript
// Added Future Enhancement
shiftType: ENUM('GENERAL', 'SHIFT') // For shift-based work support
```

### 2️⃣ **Service Layer Reorganization**

#### New: DateCalculationService
**Purpose**: Single source of truth for all date/working day logic
**Location**: `backend/src/services/core/dateCalculation.service.js`

**Methods**:
- `isWorkingDay(date, workingRule)`
- `isWeekend(date, workingRule)`
- `getWorkingDaysInRange(startDate, endDate, workingRule)`
- `getActiveWorkingRule(date)`
- `formatLocalDate(date)`

**Used by**: AttendancePolicyService, leave validation, payroll

#### Renamed: CalendarDayStatusService → AttendancePolicyService
**Purpose**: Attendance policy logic ONLY
**Location**: `backend/src/services/attendance/attendancePolicy.service.js`

**IMPORTANT**: This service should ONLY be used by:
- ✅ Attendance tracking
- ✅ Leave validation  
- ✅ Payroll calculations
- ❌ NOT for calendar UI

**Methods**:
- `getDayStatus(date, employeeId)` - For attendance policy
- `validateLeaveApplication(startDate, endDate, employeeId)`
- `getWorkingDaysCount(startDate, endDate, employeeId)`
- `isAttendanceRequired(date, employeeId)`

### 3️⃣ **Clear Responsibility Boundaries**

#### Holiday Management
- **Single Authority**: Only `HolidayService` handles holiday business logic
- **No Duplication**: Other services consume results, never re-evaluate meaning
- **HR Approval Flow**: Google Calendar → HolidayService → HR Approval → Visibility

#### Calendar Data Flow
```
1. Admin creates holiday → /api/admin/holidays → HolidayService → Holiday model
2. Attendance checks → AttendancePolicyService → HolidayService.isHoliday()
3. Calendar UI → CalendarService → HolidayService.getHolidaysForRange()
```

## 🎯 **How Models Work Together**

When the system evaluates any date:

| Check | Priority | Result | Used By |
|-------|----------|--------|---------|
| Holiday | 1st | NON-WORKING | Attendance, Leave, Payroll |
| Weekend (WorkingRule) | 2nd | NON-WORKING | Attendance, Leave, Payroll |
| Leave | 3rd | NON-WORKING | Attendance only |
| Working Day | 4th | WORKING | All systems |

### Example: January 26 (Republic Day)
```javascript
// Check sequence
const holiday = await HolidayService.isHoliday('2024-01-26');
if (holiday && holiday.hrApprovalStatus === 'approved') {
  return {
    status: 'HOLIDAY',
    attendanceRequired: false,
    includeInPayroll: holiday.includeInPayroll,
    visibleToEmployees: holiday.visibleToEmployees
  };
}
// Continue with weekend/working day checks...
```

## 📁 **File Structure Changes**

### New Files Created
```
backend/src/services/
├── core/
│   └── dateCalculation.service.js     # Date/working day logic
├── attendance/
│   └── attendancePolicy.service.js   # Attendance policy (renamed)
└── index.js                          # Service exports

backend/src/migrations/
└── add-model-improvements.js         # New model fields
```

### Files to Update (Next Phase)
```
backend/src/controllers/calendar/
├── smartCalendar.controller.js       # Remove UI methods, keep policy only
└── calendarView.controller.js        # Remove holiday CRUD, keep UI only

backend/src/routes/
├── calendar.routes.js                # DELETE (redundant)
└── admin/holiday.routes.js           # Keep as single holiday authority
```

## 🚀 **Migration Instructions**

1. **Run the migration**:
   ```bash
   node backend/run-migration.js add-model-improvements
   ```

2. **Update imports** in existing controllers:
   ```javascript
   // Old
   import calendarDayStatusService from '../services/calendar/calendarDayStatus.service.js';
   
   // New
   import AttendancePolicyService from '../services/attendance/attendancePolicy.service.js';
   import DateCalculationService from '../services/core/dateCalculation.service.js';
   ```

3. **Update method calls**:
   ```javascript
   // Old
   const isWeekend = await WorkingRule.isWeekendByDayIndex(dayOfWeek);
   
   // New
   const isWeekend = await DateCalculationService.isWeekendByDayIndex(dayOfWeek);
   ```

## 🎯 **Next Steps (Phase 2)**

1. **Route Consolidation**:
   - Delete duplicate holiday endpoints
   - Merge calendar controllers
   - Create single calendar API for UI

2. **Service Integration**:
   - Create unified CalendarService for UI
   - Create EventAggregationService
   - Create LeaveValidationService

3. **Google Calendar Integration**:
   - Import holidays with `hrApprovalStatus: 'pending'`
   - HR approval workflow
   - Automatic visibility control

## 🏆 **Benefits Achieved**

- ✅ **Clear Boundaries**: Each service has single responsibility
- ✅ **No Duplication**: Holiday logic in one place only
- ✅ **Enterprise Ready**: HR approval workflow for imported holidays
- ✅ **Maintainable**: Easy to understand what each service does
- ✅ **Scalable**: Ready for department-wise rules, shift support
- ✅ **Audit Compliant**: Clear separation of attendance vs UI concerns

## 📝 **Key Principles Applied**

1. **Models**: Data structure only, no business logic
2. **Services**: Single responsibility, clear boundaries
3. **Controllers**: Thin layer, delegate to services
4. **Routes**: Clear separation (admin vs employee vs policy)
5. **Naming**: Reflects actual usage (AttendancePolicy vs CalendarDay)

Your architecture was already enterprise-grade. These improvements just add the clarity and boundaries needed for long-term maintenance and team collaboration.