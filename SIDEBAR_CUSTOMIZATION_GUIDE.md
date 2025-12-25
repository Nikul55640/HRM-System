# Sidebar Customization Guide

## Overview
The Sidebar has been updated to include all available pages from the routes configuration. You can easily enable/disable pages by modifying the sidebar configuration.

## Current Sidebar Structure

### 1. **General Section** (Always Visible)
- Dashboard (`/dashboard`)

### 2. **My Self Service** (Employee Only - Collapsible)
- My Profile (`/employee/profile`)
- Bank Details (`/employee/bank-details`)
- My Attendance (`/employee/attendance`)
- My Leave (`/employee/leave`)
- My Leads (`/employee/leads`)
- My Shifts (`/employee/shifts`)
- Calendar & Events (`/employee/calendar`)

### 3. **HR Administration** (HR/SuperAdmin - Collapsible)
- Employees (`/admin/employees`)
- Departments (`/admin/departments`)
- Attendance Management (`/admin/attendance`)
- **Attendance Corrections** (`/admin/attendance/corrections`) ✨ NEW
- Leave Requests (`/admin/leave`)
- Leave Balances (`/admin/leave-balances`)
- Lead Management (`/admin/leads`)
- Shift Management (`/admin/shifts`)
- Events (`/admin/events`)
- **Holidays** (`/admin/holidays`) ✨ NEW

### 4. **System Administration** (SuperAdmin Only - Collapsible)
- User Management (`/admin/users`)
- System Policies (`/admin/system-policies`)
- Audit Logs (`/admin/audit-logs`)

## All Available Routes

### Employee Routes (ESS)
```
/employee/profile              - My Profile
/employee/bank-details         - Bank Details
/employee/attendance           - My Attendance
/employee/leave                - My Leave
/employee/leads                - My Leads
/employee/shifts               - My Shifts
/employee/calendar             - Calendar & Events
```

### Admin Routes
```
/admin/employees               - Employee Management
/admin/departments             - Department Management
/admin/attendance              - Attendance Management
/admin/attendance/corrections  - Attendance Corrections
/admin/leave                   - Leave Requests
/admin/leave-balances          - Leave Balances
/admin/leads                   - Lead Management
/admin/shifts                  - Shift Management
/admin/events                  - Events
/admin/holidays                - Holidays
/admin/users                   - User Management
/admin/system-policies         - System Policies
/admin/audit-logs              - Audit Logs
```

## How to Customize the Sidebar

### Add a New Page to Sidebar

1. **Add the route** in the appropriate route file:
   - Employee routes: `src/routes/essRoutes.jsx`
   - Admin routes: `src/routes/adminRoutes.jsx`

2. **Add the menu item** in `src/core/layout/Sidebar.jsx`:

```javascript
{
  name: "Page Name",
  path: "/path/to/page",
  icon: "IconName",  // From lucide-react
  showIf: () => can.do(MODULES.FEATURE.PERMISSION)
}
```

### Hide a Page from Sidebar

Option 1: Remove the item from the `allNavItems` array

Option 2: Set `showIf` to return `false`:
```javascript
{
  name: "Hidden Page",
  path: "/hidden/page",
  icon: "Eye",
  showIf: () => false  // This page won't show
}
```

### Change Page Visibility by Role

```javascript
{
  name: "Page Name",
  path: "/path/to/page",
  icon: "IconName",
  showIf: () => user?.role === 'SuperAdmin'  // Only SuperAdmin sees this
}
```

### Add Permission-Based Visibility

```javascript
{
  name: "Page Name",
  path: "/path/to/page",
  icon: "IconName",
  showIf: () => can.do(MODULES.FEATURE.PERMISSION)
}
```

## Icon Names (from lucide-react)

Common icons used:
- `LayoutDashboard` - Dashboard
- `User` - Profile
- `Banknote` - Bank Details
- `Clock` - Attendance/Time
- `CalendarDays` - Leave
- `Target` - Leads
- `Calendar` - Shifts/Calendar
- `CalendarRange` - Calendar Range
- `Users` - Employees
- `Building2` - Departments
- `Clock4` - Attendance Management
- `ClipboardCheck` - Leave Requests
- `ClipboardEdit` - Corrections
- `Scale` - Balances
- `Settings` - Settings/Configuration
- `UserCog` - User Management
- `ListChecks` - Audit Logs
- `PartyPopper` - Holidays
- `Shield` - System Admin
- `Home` - Home

## Permission Modules

Available permission checks:
```javascript
MODULES.EMPLOYEE.VIEW_OWN
MODULES.EMPLOYEE.VIEW_ALL
MODULES.ATTENDANCE.VIEW_OWN
MODULES.ATTENDANCE.VIEW_ALL
MODULES.ATTENDANCE.EDIT_ANY
MODULES.ATTENDANCE.MANAGE_SHIFTS
MODULES.LEAVE.VIEW_OWN
MODULES.LEAVE.VIEW_ALL
MODULES.LEAVE.APPROVE_ANY
MODULES.LEAVE.MANAGE_BALANCE
MODULES.LEAVE.MANAGE_POLICIES
MODULES.LEAD.VIEW
MODULES.LEAD.CREATE
MODULES.LEAD.MANAGE_ALL
MODULES.CALENDAR.VIEW
MODULES.CALENDAR.MANAGE
MODULES.DEPARTMENT.VIEW
MODULES.DEPARTMENT.CREATE
MODULES.USER.VIEW
MODULES.SYSTEM.VIEW_CONFIG
MODULES.SYSTEM.MANAGE_CONFIG
MODULES.SYSTEM.VIEW_AUDIT_LOGS
```

## Example: Add a New Admin Page

### Step 1: Create the page component
```javascript
// src/modules/admin/pages/NewPage.jsx
export default function NewPage() {
  return <div>New Page Content</div>;
}
```

### Step 2: Add route
```javascript
// src/routes/adminRoutes.jsx
const NewPage = lazy(() => import("../modules/admin/pages/NewPage"));

export const adminRoutes = [
  // ... existing routes
  { path: "admin/new-page", element: <NewPage />, roles: ["SuperAdmin", "HR"] },
];
```

### Step 3: Add to Sidebar
```javascript
// src/core/layout/Sidebar.jsx
{
  name: "New Page",
  path: "/admin/new-page",
  icon: "Zap",
  showIf: () => can.do(MODULES.SYSTEM.MANAGE_CONFIG),
}
```

## Sidebar Features

✅ **Collapsible Sections** - Click section header to expand/collapse
✅ **Hover Expansion** - Sidebar expands on hover for quick access
✅ **Active State** - Current page is highlighted in blue
✅ **Role-Based Visibility** - Pages only show for authorized roles
✅ **Permission Checks** - Fine-grained permission control
✅ **Badge Support** - Show notification badges on items
✅ **Responsive** - Collapses to icon-only on narrow screens

## Recent Updates

✨ **NEW in Latest Update:**
- Added "Attendance Corrections" page to HR Administration
- Added "Holidays" page to HR Administration
- Made "My Self Service" section collapsible
- Improved section organization
- Better permission-based visibility

## Testing the Sidebar

1. **Login as Employee** - Should see "My Self Service" section
2. **Login as HR** - Should see "HR Administration" section
3. **Login as SuperAdmin** - Should see all sections
4. **Hover over sidebar** - Should expand to show full menu
5. **Click section headers** - Should collapse/expand sections
6. **Click menu items** - Should navigate to pages

## Troubleshooting

### Page not showing in sidebar?
- Check if `showIf()` returns `true`
- Verify user role matches the condition
- Check if permission is granted

### Icon not displaying?
- Verify icon name is correct (case-sensitive)
- Check if icon exists in lucide-react
- Use `Icon` component from `shared/components`

### Route not working?
- Verify route is added to appropriate route file
- Check path matches exactly
- Ensure component is imported correctly

## File Locations

- **Sidebar Component:** `src/core/layout/Sidebar.jsx`
- **Route Configuration:** `src/routes/`
- **Permission Definitions:** `src/core/utils/rolePermissions.js`
- **Page Components:** `src/modules/*/pages/`
