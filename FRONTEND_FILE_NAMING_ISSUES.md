# Frontend File Naming Issues - Critical Duplicates & Overlaps

## 🚨 URGENT: Critical Duplicates Found

Based on file name analysis, the following duplicates will cause import confusion and must be fixed immediately.

---

## 🔴 HIGH-CONFIDENCE DUPLICATES (MUST FIX)

### 1️⃣ DetailModal.jsx — REAL DUPLICATE ❌

**Files:**
- `shared/components/DetailModal.jsx`
- `shared/ui/DetailModal.jsx`

**🚨 Problem:**
- Same exact name
- Different folders
- Import confusion guaranteed

**💥 Example future bug:**
```javascript
import DetailModal from '@/shared/components/DetailModal'; // vs
import DetailModal from '@/shared/ui/DetailModal';
```

**✅ Fix (recommended):**
Rename by responsibility:
- `shared/components/EntityDetailModal.jsx` (feature-specific usage)
- `shared/ui/DetailModal.jsx` (keep as base UI component)

**⚠ This is the most important rename in frontend.**

---

### 2️⃣ EmptyState.jsx — REAL DUPLICATE ❌

**Files:**
- `shared/components/EmptyState.jsx`
- `shared/ui/EmptyState.jsx`

**🚨 Problem:**
Same issue as DetailModal above.

**✅ Suggested:**
- `shared/components/FeatureEmptyState.jsx` (feature-specific)
- `shared/ui/EmptyState.jsx` (keep generic base component)

---

## ⚠️ CONFUSING OVERLAPS (HIGH PRIORITY)

### 3️⃣ Calendar View Explosion (Naming Conflict Risk)

**Files:**
- `calendar/components/UnifiedCalendarView.jsx`
- `calendar/pages/CalendarView.jsx`
- `employee/calendar/EmployeeCalendarView.jsx`

**🔍 Problem:**
- Three files with "Calendar + View"
- Names don't explain scope or audience

**✅ Suggested clarity:**
- `UnifiedCalendarView.jsx` → (engine-level, keep as is)
- `CalendarView.jsx` → `AdminCalendarPage.jsx`
- `EmployeeCalendarView.jsx` → `EmployeeCalendarPage.jsx`

---

### 4️⃣ Dashboard Naming Overlap ⚠️

**Files:**
- `employee/pages/Dashboard/Dashboard.jsx`
- `employee/pages/Dashboard/EmployeeDashboard.jsx`
- `admin/pages/Dashboard/AdminDashboard.jsx`

**🔍 Problem:**
- `Dashboard.jsx` is meaningless alone
- One dashboard folder has two dashboards

**✅ Suggested:**
- Keep `EmployeeDashboard.jsx` (only)
- Keep `AdminDashboard.jsx`
- Delete or rename the thin `Dashboard.jsx` wrapper if possible

---

### 5️⃣ Attendance "Summary / Stats / Widget" Cluster ⚠️

**Files:**
- `AttendanceSummary.jsx`
- `AttendanceStatsWidget.jsx`
- `LeaveBalanceWidget.jsx`
- `ShiftStatusWidget.jsx`

**⚠ Not wrong, but:**
- Summary/Stats/Widget are used inconsistently

**✅ Rule suggestion:**
- Widget → small dashboard card
- Summary → page-level aggregate

**Example:**
- `AttendanceSummaryPage.jsx`
- `AttendanceStatsCard.jsx`

---

### 6️⃣ Calendar Services Overlap ⚠️

**Files:**
- `calendarService.js`
- `calendarViewService.js`
- `smartCalendarService.js`
- `employeeCalendarService.js`

**🔍 From names alone:**
- Hard to know which one to call
- "calendar" repeated everywhere

**✅ Naming clarity:**
- `calendarCoreService.js`
- `calendarViewQueryService.js`
- `smartCalendarRuleService.js`
- `employeeCalendarService.js` (OK)

---

### 7️⃣ Attendance Stores Duplication ⚠️

**Files:**
- `useAttendanceStore.js`
- `useAttendanceSessionStore.js`

**⚠ This is acceptable, but naming could improve clarity.**

**Suggested:**
- `useAttendanceDataStore.js` (One = data)
- `useAttendanceSessionStore.js` (one = live session)

---

## 🟡 SOFT OVERLAPS (OK but Watch Closely)

These are not bugs, just things to be careful with.

### Hooks Location Split
**Files:**
- `core/hooks/*`
- `hooks/useNotifications.js`
- `services/useEmployeeSelfService.js`

**⚠ Hooks scattered in 3 places.**

**✅ Acceptable, but document rules:**
- `core/hooks` → infrastructure
- `modules/*/hooks` → feature-specific
- `services/use*` → API-bound hooks

### Employee vs Employees Module ⚠️
**Directories:**
- `modules/employee/` (self-service)
- `modules/employees/` (admin management)

**🔍 Singular vs plural is dangerous.**

**✅ Strong recommendation:**
- `employee/` → self-service (ESS)
- `employees/` → admin management

**Add README or rename:**
- `employeeSelf/`
- `employeeAdmin/`

---

## 🟢 LOOKS SIMILAR BUT ACTUALLY CORRECT (DO NOT TOUCH)

These are good separations, not duplicates:

✅ `calendarificService.js` vs `calendarService.js`  
✅ `AttendancePage.jsx` vs `ManageAttendance.jsx`  
✅ `LeavePage.jsx` vs `LeaveManagement.jsx`  
✅ `NotificationBell.jsx` vs `NotificationsPage.jsx`  
✅ `useNotificationStore.js` vs `notificationService.js`  
✅ `attendanceCalculations.js` vs `attendanceDataMapper.js`

---

## 📊 Summary Table

| Area | Status | Action Required |
|------|--------|----------------|
| DetailModal | ❌ REAL duplicate | MUST rename |
| EmptyState | ❌ REAL duplicate | MUST rename |
| Calendar Views | ⚠ Naming confusion | Should rename |
| Dashboard files | ⚠ Overlap | Should clean up |
| Attendance widgets | ⚠ Soft overlap | Consider renaming |
| Services naming | ⚠ Needs clarity | Should improve |
| Stores | 🟡 Minor | Optional |
| Overall architecture | ✅ SOLID | No action needed |

---

## ✅ Final Verdict

- ❌ **2 real duplicate names that MUST be fixed**
- ⚠ **Several naming overlaps that can confuse**
- ✅ **No structural disaster**
- ✅ **Feature-based architecture is strong**

---

## 🚀 Recommended Action Plan

### Phase 1: Critical Fixes (Immediate)
1. Rename `shared/components/DetailModal.jsx` → `EntityDetailModal.jsx`
2. Rename `shared/components/EmptyState.jsx` → `FeatureEmptyState.jsx`
3. Clean up Dashboard folder (remove duplicate)

### Phase 2: Clarity Improvements (Soon)
1. Rename Calendar View files for clarity
2. Standardize Widget/Summary/Stats naming
3. Improve service naming consistency

### Phase 3: Organizational (Later)
1. Consider employee/employees module renaming
2. Document hook location rules
3. Standardize store naming patterns

---

**Status**: 🔴 CRITICAL ISSUES IDENTIFIED  
**Priority**: HIGH - Import confusion will cause bugs  
**Impact**: Developer experience, maintainability  
**Effort**: Low (mostly file renames + import updates)