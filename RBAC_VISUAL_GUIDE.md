# RBAC Sidebar Navigation - Visual Guide

## Sidebar Structure by Role

### 🟢 Employee Role
```
┌─────────────────────────────────────┐
│         HRM System v1.0             │
├─────────────────────────────────────┤
│                                     │
│  📊 Overview                        │
│    ├─ Dashboard                     │
│    └─ Notifications                 │
│                                     │
│  👤 My Workspace  ← EMPLOYEE ONLY   │
│    ├─ Profile                       │
│    ├─ Bank Details                  │
│    ├─ Attendance                    │
│    ├─ Attendance Corrections        │
│    ├─ Leave                         │
│    ├─ Leads                         │
│    ├─ Shifts                        │
│    └─ Calendar                      │
│                                     │
│  ⚙️ Settings  ← EMPLOYEE ONLY       │
│    ├─ Profile                       │
│    ├─ Security                      │
│    └─ Emergency Contacts            │
│                                     │
├─────────────────────────────────────┤
│    HRM System v1.0 © 2025           │
└─────────────────────────────────────┘
```

---

### 🟠 HR_Manager Role
```
┌─────────────────────────────────────┐
│         HRM System v1.0             │
├─────────────────────────────────────┤
│                                     │
│  📊 Overview                        │
│    ├─ Dashboard                     │
│    └─ Notifications                 │
│                                     │
│  📋 Requests & Approvals            │
│    ├─ Attendance Corrections        │
│    └─ Leave Requests                │
│                                     │
│  ⏰ Attendance & Time                │
│    ├─ Attendance Overview           │
│    ├─ Live Attendance               │
│    └─ Shift Management              │
│                                     │
│  📅 Leave & Holidays                │
│    ├─ Leave Balances                │
│    ├─ Holiday Management            │
│    ├─ Smart Calendar                │
│    └─ Holiday Sync                  │
│                                     │
│  👥 People                          │
│    ├─ Employees                     │
│    ├─ Departments                   │
│    ├─ Designations                  │
│    ├─ Bank Verification             │
│    └─ Lead Management               │
│                                     │
│  🏢 Organization                    │
│    ├─ Policies                      │
│    ├─ Documents                     │
│    └─ Announcements                 │
│                                     │
├─────────────────────────────────────┤
│    HRM System v1.0 © 2025           │
└─────────────────────────────────────┘
```

---

### 🔴 HR_Admin Role
```
┌─────────────────────────────────────┐
│         HRM System v1.0             │
├─────────────────────────────────────┤
│                                     │
│  📊 Overview                        │
│    ├─ Dashboard                     │
│    └─ Notifications                 │
│                                     │
│  📋 Requests & Approvals            │
│    ├─ Attendance Corrections        │
│    └─ Leave Requests                │
│                                     │
│  ⏰ Attendance & Time                │
│    ├─ Attendance Overview           │
│    ├─ Live Attendance               │
│    └─ Shift Management              │
│                                     │
│  📅 Leave & Holidays                │
│    ├─ Leave Balances                │
│    ├─ Rollover                      │
│    ├─ Holiday Management            │
│    ├─ Smart Calendar                │
│    └─ Holiday Sync                  │
│                                     │
│  👥 People                          │
│    ├─ Employees                     │
│    ├─ Departments                   │
│    ├─ Designations                  │
│    ├─ Bank Verification             │
│    └─ Lead Management               │
│                                     │
│  🏢 Organization                    │
│    ├─ Policies                      │
│    ├─ Documents                     │
│    └─ Announcements                 │
│                                     │
│  🔒 System  ← HR_ADMIN & SUPERADMIN │
│    ├─ Users & Roles                 │
│    ├─ Admin Settings                │
│    ├─ System Policies               │
│    └─ Audit Logs                    │
│                                     │
├─────────────────────────────────────┤
│    HRM System v1.0 © 2025           │
└─────────────────────────────────────┘
```

---

### 🔵 SuperAdmin Role
```
┌─────────────────────────────────────┐
│         HRM System v1.0             │
├─────────────────────────────────────┤
│                                     │
│  📊 Overview                        │
│    ├─ Dashboard                     │
│    └─ Notifications                 │
│                                     │
│  📋 Requests & Approvals            │
│    ├─ Attendance Corrections        │
│    └─ Leave Requests                │
│                                     │
│  ⏰ Attendance & Time                │
│    ├─ Attendance Overview           │
│    ├─ Live Attendance               │
│    └─ Shift Management              │
│                                     │
│  📅 Leave & Holidays                │
│    ├─ Leave Balances                │
│    ├─ Rollover                      │
│    ├─ Holiday Management            │
│    ├─ Smart Calendar                │
│    └─ Holiday Sync                  │
│                                     │
│  👥 People                          │
│    ├─ Employees                     │
│    ├─ Departments                   │
│    ├─ Designations                  │
│    ├─ Bank Verification             │
│    └─ Lead Management               │
│                                     │
│  🏢 Organization                    │
│    ├─ Policies                      │
│    ├─ Documents                     │
│    └─ Announcements                 │
│                                     │
│  🔒 System                          │
│    ├─ Users & Roles                 │
│    ├─ Admin Settings                │
│    ├─ System Policies               │
│    └─ Audit Logs                    │
│                                     │
├─────────────────────────────────────┤
│    HRM System v1.0 © 2025           │
└─────────────────────────────────────┘
```

---

## Permission Inheritance Hierarchy

```
                    ┌──────────────────┐
                    │   SuperAdmin     │
                    │  (All Perms)     │
                    └────────┬─────────┘
                             │
                             │ Inherits
                             ▼
                    ┌──────────────────┐
                    │    HR_Admin      │
                    │ (HR Ops + Admin) │
                    └────────┬─────────┘
                             │
                             │ Inherits
                             ▼
                    ┌──────────────────┐
                    │   HR_Manager     │
                    │  (HR Operations) │
                    └────────┬─────────┘
                             │
                             │ Inherits
                             ▼
                    ┌──────────────────┐
                    │    Employee      │
                    │ (Self-Service)   │
                    └──────────────────┘
```

---

## The Fix Explained

### Before Fix (❌ WRONG)
```
My Workspace Section:
  showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN)
  
  Result:
  - Employee: ✅ Has permission → VISIBLE
  - HR_Manager: ✅ Has permission (inherited) → VISIBLE ❌ WRONG!
  - HR_Admin: ✅ Has permission (inherited) → VISIBLE ❌ WRONG!
  - SuperAdmin: ✅ Has permission (inherited) → VISIBLE ❌ WRONG!
```

### After Fix (✅ CORRECT)
```
My Workspace Section:
  showIf: () => can.do(MODULES.EMPLOYEE.VIEW_OWN) && user?.role === "Employee"
  
  Result:
  - Employee: ✅ Has permission AND is Employee → VISIBLE ✅
  - HR_Manager: ✅ Has permission BUT not Employee → HIDDEN ✅
  - HR_Admin: ✅ Has permission BUT not Employee → HIDDEN ✅
  - SuperAdmin: ✅ Has permission BUT not Employee → HIDDEN ✅
```

---

## Decision Tree

```
User logs in
    │
    ├─ Is role "Employee"?
    │   ├─ YES → Show "My Workspace" + "Settings"
    │   │        Show "Overview" only
    │   │        Hide all admin sections
    │   │
    │   └─ NO → Hide "My Workspace" + "Settings"
    │           Show "Overview"
    │           Show admin sections based on permissions
    │
    └─ Is role "HR_Manager" or "HR_Admin" or "SuperAdmin"?
        ├─ YES → Show admin sections
        │        Hide personal sections
        │        (System section only for HR_Admin/SuperAdmin)
        │
        └─ NO → Show only Employee sections
```

---

## Access Control Matrix

```
┌──────────────────┬──────────┬────────────┬──────────┬───────────┐
│ Section          │ Employee │ HR_Manager │ HR_Admin │ SuperAdmin│
├──────────────────┼──────────┼────────────┼──────────┼───────────┤
│ Overview         │    ✅    │     ✅     │    ✅    │     ✅    │
│ My Workspace     │    ✅    │     ❌     │    ❌    │     ❌    │
│ Settings         │    ✅    │     ❌     │    ❌    │     ❌    │
│ Requests & Apps  │    ❌    │     ✅     │    ✅    │     ✅    │
│ Attendance & Time│    ❌    │     ✅     │    ✅    │     ✅    │
│ Leave & Holidays │    ❌    │     ✅     │    ✅    │     ✅    │
│ People           │    ❌    │     ✅     │    ✅    │     ✅    │
│ Organization     │    ❌    │     ✅     │    ✅    │     ✅    │
│ System           │    ❌    │     ❌     │    ✅    │     ✅    │
└──────────────────┴──────────┴────────────┴──────────┴───────────┘
```

---

## Code Logic Visualization

### My Workspace Section
```javascript
showIf: () => {
  // Step 1: Check permission
  const hasPermission = can.do(MODULES.EMPLOYEE.VIEW_OWN);
  
  // Step 2: Check role
  const isEmployee = user?.role === "Employee";
  
  // Step 3: Both must be true (AND logic)
  return hasPermission && isEmployee;
}

// Examples:
// Employee: true && true = true → VISIBLE ✅
// HR_Manager: true && false = false → HIDDEN ✅
// HR_Admin: true && false = false → HIDDEN ✅
// SuperAdmin: true && false = false → HIDDEN ✅
```

---

## Testing Flowchart

```
Start Test
    │
    ├─ Login as Employee
    │   ├─ Check "My Workspace" visible? → YES ✅
    │   ├─ Check "Settings" visible? → YES ✅
    │   ├─ Check admin sections hidden? → YES ✅
    │   └─ PASS ✅
    │
    ├─ Login as HR_Manager
    │   ├─ Check "My Workspace" hidden? → YES ✅
    │   ├─ Check "Settings" hidden? → YES ✅
    │   ├─ Check admin sections visible? → YES ✅
    │   ├─ Check "System" hidden? → YES ✅
    │   └─ PASS ✅
    │
    ├─ Login as HR_Admin
    │   ├─ Check "My Workspace" hidden? → YES ✅
    │   ├─ Check "Settings" hidden? → YES ✅
    │   ├─ Check admin sections visible? → YES ✅
    │   ├─ Check "System" visible? → YES ✅
    │   └─ PASS ✅
    │
    └─ Login as SuperAdmin
        ├─ Check "My Workspace" hidden? → YES ✅
        ├─ Check "Settings" hidden? → YES ✅
        ├─ Check admin sections visible? → YES ✅
        ├─ Check "System" visible? → YES ✅
        └─ PASS ✅

All Tests Pass → ✅ DEPLOYMENT READY
```

---

## Key Takeaways

1. **Hybrid Approach**: Combine permissions (what) + roles (who)
2. **AND Logic**: Both conditions must be true
3. **Clear Separation**: Personal sections for Employee, admin sections for HR roles
4. **No Confusion**: Each role sees exactly what they need
5. **Secure**: Proper access control prevents unauthorized access

---

## Related Documentation

- Quick Reference: `RBAC_QUICK_FIX_REFERENCE.md`
- Full Summary: `RBAC_SIDEBAR_FIX_SUMMARY.md`
- Testing Guide: `RBAC_TESTING_GUIDE.md`
- Feature Matrix: `ROLE_FUNCTIONALITY_MATRIX.md`
- Task Summary: `TASK_5_COMPLETION_SUMMARY.md`
