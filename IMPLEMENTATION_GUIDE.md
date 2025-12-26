# HRM System - Route Implementation Guide

**Quick Reference:** Step-by-step instructions to close all routing gaps

---

## 🚀 Quick Start

**Total Changes Required:**
- ✏️ 1 file to modify (adminRoutes.jsx)
- ❌ 1 file to delete (CalendarTestPage.jsx)
- 🔍 3 files to review (SimpleAttendancePage, MyLeave, NoEmployeeProfile)

**Estimated Time:** 15-20 minutes

---

## STEP 1: Update adminRoutes.jsx

### Location
`HRM-System/frontend/src/routes/adminRoutes.jsx`

### What to Do

#### A. Add Imports (at the top with other lazy imports)

Find this section:
```javascript
const AuditLogsPage = lazy(() =>
  import("../modules/admin/pages/Dashboard/AuditLogsPage")
);
```

Add these imports after the existing ones:
```javascript
// Attendance Analytics & Monitoring
const LiveAttendanceDashboard = lazy(() =>
  import("../modules/attendance/admin/LiveAttendanceDashboard")
);
const AttendanceSummaryPage = lazy(() =>
  import("../modules/attendance/pages/AttendanceSummaryPage")
);
const AttendanceDashboard = lazy(() =>
  import("../modules/attendance/employee/AttendanceDashboard")
);
const AttendanceInsights = lazy(() =>
  import("../modules/attendance/employee/AttendanceInsights")
);

// Leave Management
const HRLeaveApprovals = lazy(() =>
  import("../modules/leave/hr/HRLeaveApprovals")
);

// Calendar Management
const CalendarManagement = lazy(() =>
  import("../modules/calendar/CalendarManagement")
);
```

#### B. Add Routes (in the adminRoutes array)

Find this section:
```javascript
export const adminRoutes = [
  // Feature 4: Employee Management
  { path: "admin/employees", element: <EmployeeList />, roles: ["SuperAdmin", "HR"] },
  // ... more routes
];
```

Add these routes in the appropriate feature sections:

**After Attendance Management section:**
```javascript
  // Feature 2: Attendance Management - Analytics & Monitoring
  { path: "admin/attendance/live", element: <LiveAttendanceDashboard />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/summary", element: <AttendanceSummaryPage />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/dashboard", element: <AttendanceDashboard />, roles: ["SuperAdmin", "HR"] },
  { path: "admin/attendance/insights", element: <AttendanceInsights />, roles: ["SuperAdmin", "HR"] },
```

**After Leave Management section:**
```javascript
  // Feature 3: Leave Management - Approvals
  { path: "admin/leave/approvals", element: <HRLeaveApprovals />, roles: ["SuperAdmin", "HR"] },
```

**After Calendar section (or create new Calendar section):**
```javascript
  // Feature 7: Calendar & Events - Management
  { path: "admin/calendar/management", element: <CalendarManagement />, roles: ["SuperAdmin", "HR"] },
```

### Verification
After editing, the file should have:
- ✅ 6 new lazy imports
- ✅ 6 new route definitions
- ✅ No syntax errors
- ✅ Proper role-based access control

---

## STEP 2: Delete Test File

### Location
`HRM-System/frontend/src/modules/calendar/CalendarTestPage.jsx`

### What to Do
1. Delete the file completely
2. Search for any imports of this file:
   ```
   grep -r "CalendarTestPage" HRM-System/frontend/src/
   ```
3. If found, remove the imports

### Verification
- ✅ File deleted
- ✅ No broken imports
- ✅ No console errors

---

## STEP 3: Review Files (Medium Priority)

### File 1: SimpleAttendancePage.jsx

**Location:** `HRM-System/frontend/src/modules/attendance/employee/SimpleAttendancePage.jsx`

**Decision Process:**
```
1. Open the file
2. Check if it's imported anywhere:
   grep -r "SimpleAttendancePage" HRM-System/frontend/src/
3. If NO imports found → DELETE the file
4. If imports found → Check if it's used as a component or page
   - If component → Keep it
   - If page → Route it as /admin/attendance/simple
```

**Recommendation:** Most likely delete (appears to be legacy)

---

### File 2: MyLeave.jsx

**Location:** `HRM-System/frontend/src/modules/leave/employee/MyLeave.jsx`

**Decision Process:**
```
1. Open MyLeave.jsx
2. Open LeavePage.jsx (at modules/leave/employee/LeavePage.jsx)
3. Compare the two files:
   - If identical → DELETE MyLeave.jsx
   - If different → Keep both and route MyLeave as /employee/leave/my-leave
4. Check imports:
   grep -r "MyLeave" HRM-System/frontend/src/
```

**Recommendation:** Most likely delete (appears to be duplicate)

---

### File 3: NoEmployeeProfile.jsx

**Location:** `HRM-System/frontend/src/modules/employees/pages/NoEmployeeProfile.jsx`

**Decision Process:**
```
1. Check where it's used:
   grep -r "NoEmployeeProfile" HRM-System/frontend/src/
2. If used inside EmployeeProfile.jsx → KEEP as component
3. If not used → DELETE
```

**Recommendation:** Keep as component (used for edge cases)

---

## STEP 4: Test All Changes

### Test 1: Verify Routes Load
```bash
# Start the frontend dev server
cd HRM-System/frontend
npm run dev
```

### Test 2: Test New Routes (as HR user)
Navigate to:
- [ ] `/admin/attendance/live` - Should load LiveAttendanceDashboard
- [ ] `/admin/attendance/summary` - Should load AttendanceSummaryPage
- [ ] `/admin/attendance/dashboard` - Should load AttendanceDashboard
- [ ] `/admin/attendance/insights` - Should load AttendanceInsights
- [ ] `/admin/leave/approvals` - Should load HRLeaveApprovals
- [ ] `/admin/calendar/management` - Should load CalendarManagement

### Test 3: Test Role-Based Access (as Employee user)
Navigate to:
- [ ] `/admin/attendance/live` - Should redirect to /unauthorized
- [ ] `/admin/leave/approvals` - Should redirect to /unauthorized
- [ ] `/admin/calendar/management` - Should redirect to /unauthorized

### Test 4: Test Sidebar Navigation
- [ ] Sidebar loads without errors
- [ ] New routes appear in sidebar (if added)
- [ ] Clicking sidebar items navigates correctly

### Test 5: Check Console
- [ ] No 404 errors for lazy-loaded components
- [ ] No import errors
- [ ] No console warnings

---

## STEP 5: Update Sidebar (Optional)

### Location
`HRM-System/frontend/src/core/layout/Sidebar.jsx`

### What to Do (Optional)
If you want new routes to appear in the sidebar, add menu items:

```javascript
// In the HR Administration section, add:
{
  label: "Live Attendance",
  path: "/admin/attendance/live",
  icon: "Activity",
  roles: ["HR", "SuperAdmin"]
},
{
  label: "Attendance Summary",
  path: "/admin/attendance/summary",
  icon: "BarChart3",
  roles: ["HR", "SuperAdmin"]
},
{
  label: "Attendance Insights",
  path: "/admin/attendance/insights",
  icon: "TrendingUp",
  roles: ["HR", "SuperAdmin"]
},
{
  label: "Leave Approvals",
  path: "/admin/leave/approvals",
  icon: "CheckCircle2",
  roles: ["HR", "SuperAdmin"]
},
{
  label: "Calendar Management",
  path: "/admin/calendar/management",
  icon: "Calendar",
  roles: ["HR", "SuperAdmin"]
}
```

---

## 📋 Checklist

### Phase 1: Implementation
- [ ] Added 6 lazy imports to adminRoutes.jsx
- [ ] Added 6 new routes to adminRoutes.jsx
- [ ] Deleted CalendarTestPage.jsx
- [ ] Verified no broken imports

### Phase 2: Review
- [ ] Reviewed SimpleAttendancePage.jsx (delete or keep)
- [ ] Reviewed MyLeave.jsx (delete or keep)
- [ ] Reviewed NoEmployeeProfile.jsx (keep as component)

### Phase 3: Testing
- [ ] All new routes load correctly
- [ ] Role-based access control works
- [ ] Sidebar navigation works
- [ ] No console errors
- [ ] No 404 errors

### Phase 4: Documentation
- [ ] Updated ROUTING_AUDIT_REPORT.md
- [ ] Updated FEATURE_ROUTE_GAP_ANALYSIS.md
- [ ] Documented any decisions made

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" error
**Solution:** Check import path is correct
```javascript
// Correct format:
const ComponentName = lazy(() =>
  import("../path/to/ComponentName")
);
```

### Issue: Route not appearing in sidebar
**Solution:** Add menu item to Sidebar.jsx with correct path and roles

### Issue: "Unauthorized" when accessing new route
**Solution:** Check role-based access control in route definition
```javascript
{ path: "admin/...", element: <Component />, roles: ["HR", "SuperAdmin"] }
```

### Issue: Lazy loading not working
**Solution:** Verify component exists at import path
```bash
ls -la HRM-System/frontend/src/modules/attendance/admin/LiveAttendanceDashboard.jsx
```

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message in browser console
2. Verify file paths are correct
3. Ensure all imports are added
4. Check role-based access control
5. Review ROUTING_AUDIT_REPORT.md for reference

---

## ✅ Success Criteria

After implementation, you should have:
- ✅ 6 new routes working correctly
- ✅ All routes accessible to HR/SuperAdmin
- ✅ All routes blocked for Employee role
- ✅ No console errors
- ✅ 100% feature coverage
- ✅ All tests passing
