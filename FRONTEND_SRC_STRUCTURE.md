# Frontend Source Structure

## Overview
This document outlines the complete structure of the HRM System frontend source code, built with React.js and following modern frontend architecture patterns.

```
frontend/src/
├── App.jsx                         # Main application component
├── App.zustand.js                  # Zustand store configuration
├── main.jsx                        # Application entry point
├── index.css                       # Global styles
├── components/                     # Global components
│   └── NotificationBell.jsx       # Global notification component
├── core/                          # Core application infrastructure
│   ├── guards/                    # Route protection and access control
│   │   ├── index.js
│   │   ├── PermissionGate.jsx     # Permission-based component rendering
│   │   ├── ProtectedRoute.jsx     # Route-level protection
│   │   └── RoleGate.jsx           # Role-based component rendering
│   ├── hooks/                     # Core custom hooks
│   │   ├── index.js
│   │   ├── use-toast.js           # Toast notification hook
│   │   ├── useAuth.js             # Authentication hook
│   │   └── usePermissions.js      # Permission checking hook
│   ├── layout/                    # Application layout components
│   │   ├── index.js
│   │   ├── Footer.jsx             # Application footer
│   │   ├── Header.jsx             # Application header
│   │   ├── MainLayout.jsx         # Main layout wrapper
│   │   └── Sidebar.jsx            # Navigation sidebar
│   └── utils/                     # Core utility functions
│       ├── calendarEventTypes.js  # Calendar event type definitions
│       ├── errorHandler.js        # Global error handling
│       └── rolePermissions.js     # Role permission utilities
├── Debug/                         # Debug utilities (empty)
├── hooks/                         # Application-specific hooks
│   └── useNotifications.js        # Notification management hook
├── lib/                           # Third-party library configurations
│   ├── date-utils.js              # Date manipulation utilities
│   └── utils.js                   # General utility functions
├── modules/                       # Feature-based modules
│   ├── admin/                     # Admin module
│   │   └── pages/                 # Admin pages
│   │       ├── Announcements/
│   │       ├── Auditlogs/
│   │       ├── BankVerification/
│   │       ├── Dashboard/
│   │       ├── Departments/
│   │       ├── Designations/
│   │       └── Settings/
│   ├── attendance/                # Attendance management module
│   │   ├── index.js
│   │   ├── admin/                 # Admin attendance features
│   │   │   ├── AttendanceCorrections.jsx
│   │   │   ├── LiveAttendanceDashboard.jsx
│   │   │   ├── ManageAttendance.jsx
│   │   │   └── AttendanceViewModal.jsx
│   │   ├── components/            # Shared attendance components
│   │   │   ├── AttendanceForm.jsx
│   │   │   └── ShiftStatusWidget.jsx
│   │   └── employee/              # Employee attendance features
│   │       ├── AttendancePage.jsx
│   │       ├── AttendanceSummary.jsx
│   │       ├── AttendanceCorrectionRequests.jsx
│   │       └── EnhancedClockInOut.jsx
│   ├── auth/                      # Authentication module
│   │   ├── index.js
│   │   └── pages/
│   │       ├── Login.jsx
│   │       └── ForgotPassword.jsx
│   ├── calendar/                  # Calendar management module
│   │   ├── index.js
│   │   ├── README.md
│   │   ├── admin/                 # Admin calendar features
│   │   │   ├── CalendarManagement.jsx
│   │   │   ├── CalendarificManagement.jsx
│   │   │   ├── SmartCalendarManagement.jsx
│   │   │   ├── WorkingRuleForm.jsx
│   │   │   └── components/
│   │   │       ├── ApiStatusCard.jsx
│   │   │       └── HolidayTypeSelector.jsx
│   │   ├── components/            # Shared calendar components
│   │   │   └── UnifiedCalendarView.jsx
│   │   ├── employee/              # Employee calendar features
│   │   │   ├── EmployeeCalendarPage.jsx
│   │   │   ├── EmployeeCalendarView.jsx
│   │   │   └── views/
│   │   │       ├── MonthView.jsx
│   │   │       ├── WeekView.jsx
│   │   │       └── TodayView.jsx
│   │   ├── pages/                 # Calendar pages
│   │   │   └── CalendarView.jsx
│   │   └── stores/                # Calendar state management
│   ├── employee/                  # Employee self-service module
│   │   ├── index.js
│   │   ├── pages/                 # Employee pages
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── EmployeeDashboard.jsx
│   │   │   ├── LeadsPage.jsx
│   │   │   └── ShiftsPage.jsx
│   │   ├── profile/               # Employee profile management
│   │   │   └── ProfilePage.jsx
│   │   └── settings/              # Employee settings
│   │       ├── components/
│   │       │   ├── ContactInfoForm.jsx
│   │       │   └── ProfilePhotoUploader.jsx
│   │       ├── pages/
│   │       │   └── EmployeeSettings.jsx
│   │       ├── schemas/
│   │       │   └── password.schema.js
│   │       └── services/
│   │           └── employeeSettingsService.js
│   ├── employees/                 # Employee management module
│   │   ├── index.js
│   │   ├── components/            # Employee management components
│   │   │   └── OverviewTab.jsx
│   │   ├── form-steps/            # Multi-step employee forms
│   │   │   └── SystemAccessStep.jsx
│   │   ├── pages/                 # Employee management pages
│   │   │   ├── EmployeeList.jsx
│   │   │   └── EmployeeProfile.jsx
│   │   └── services/              # Employee management services
│   ├── ess/                       # Employee Self-Service module
│   │   ├── bank/                  # Bank details management
│   │   │   └── BankDetailsPage.jsx
│   │   ├── utils/                 # ESS utilities
│   │   └── validation/            # ESS validation schemas
│   ├── help/                      # Help and support module
│   │   └── HelpPage.jsx
│   ├── leads/                     # Lead management module
│   │   ├── index.js
│   │   ├── components/
│   │   │   └── ActivityForm.jsx
│   │   └── pages/
│   │       └── LeadManagement.jsx
│   ├── leave/                     # Leave management module
│   │   ├── index.js
│   │   ├── Admin/                 # Admin leave features
│   │   │   ├── LeaveBalancesPage.jsx
│   │   │   └── LeaveBalanceRolloverPage.jsx
│   │   ├── components/            # Shared leave components
│   │   │   ├── LeaveBalanceCards.jsx
│   │   │   └── LeaveHistoryTable.jsx
│   │   ├── employee/              # Employee leave features
│   │   ├── hooks/                 # Leave-specific hooks
│   │   └── hr/                    # HR leave features
│   ├── notifications/             # Notification module
│   │   └── pages/
│   │       └── NotificationsPage.jsx
│   ├── organization/              # Organization management module
│   │   ├── index.js
│   │   ├── admin/                 # Admin organization features
│   │   │   └── CustomFieldsSection.jsx
│   │   ├── components/            # Organization components
│   │   │   └── HolidayModal.jsx
│   │   └── pages/                 # Organization pages
│   └── Shift/                     # Shift management module
│       └── admin/                 # Admin shift features
│           ├── AssignShiftForm.jsx
│           ├── ShiftDetails.jsx
│           ├── ShiftForm.jsx
│           └── ShiftManagement.jsx
├── pages/                         # Global pages
│   ├── NotFound.jsx               # 404 error page
│   └── Unauthorized.jsx           # 403 error page
├── routes/                        # Application routing
│   ├── index.js                   # Route configuration
│   ├── routeConfig.js             # Route definitions
│   ├── adminRoutes.jsx            # Admin routes
│   ├── applyRoutes.jsx            # Application routes
│   ├── calendarRoutes.jsx         # Calendar routes
│   ├── dashboardRoutes.jsx        # Dashboard routes
│   ├── essRoutes.jsx              # ESS routes
│   ├── generalRoutes.jsx          # General routes
│   └── organizationRoutes.jsx     # Organization routes
├── services/                      # API service layer
│   ├── index.js                   # Service exports
│   ├── README.md                  # Service documentation
│   ├── api.js                     # Base API configuration
│   ├── adminDashboardService.js   # Admin dashboard API
│   ├── adminLeaveService.js       # Admin leave API
│   ├── announcementService.js     # Announcement API
│   ├── attendanceService.js       # Attendance API
│   ├── auditLogService.js         # Audit log API
│   ├── authService.js             # Authentication API
│   ├── birthdayService.js         # Birthday API
│   ├── calendarificService.js     # Calendarific integration
│   ├── calendarService.js         # Calendar API
│   ├── calendarViewService.js     # Calendar view API
│   ├── configService.js           # Configuration API
│   ├── dashboardService.js        # Dashboard API
│   ├── departmentService.js       # Department API
│   ├── employeeCalendarService.js # Employee calendar API
│   ├── employeeDashboardService.js # Employee dashboard API
│   ├── employeeManagementService.js # Employee management API
│   ├── employeeSelfService.js     # Employee self-service API
│   ├── employeeService.js         # Employee API
│   ├── helpSupportService.js      # Help support API
│   ├── hrmApiService.js           # HRM API
│   ├── leaveService.js            # Leave API
│   ├── leaveTypeService.js        # Leave type API
│   ├── managerService.js          # Manager API
│   ├── notificationService.js     # Notification API
│   ├── payrollService.js          # Payroll API
│   ├── recentActivityService.js   # Recent activity API
│   ├── shiftService.js            # Shift API
│   ├── smartCalendarService.js    # Smart calendar API
│   ├── useEmployeeSelfService.js  # ESS hook service
│   └── userService.js             # User API
├── shared/                        # Shared components and utilities
│   ├── components/                # Reusable components
│   │   ├── index.js
│   │   ├── ApprovalStatusBadge.jsx
│   │   ├── AttendanceStatusBadge.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── Icon.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── NotificationManager.jsx
│   │   ├── Pagination.jsx
│   │   ├── ScopeIndicator.jsx
│   │   └── SkeletonLoader.jsx
│   └── ui/                        # UI component library
│       ├── index.js
│       ├── ActionButton.jsx
│       ├── alert-dialog.jsx
│       ├── alert.jsx
│       ├── avatar.jsx
│       ├── badge.jsx
│       ├── button.jsx
│       ├── calendar.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── DataCard.jsx
│       ├── DeleteConfirmModal.jsx
│       ├── DetailModal.jsx
│       ├── dialog.jsx
│       ├── dropdown-menu.jsx
│       ├── EmptyState.jsx
│       ├── FilterBar.jsx
│       ├── form.jsx
│       ├── hover-card.jsx
│       ├── HRMCard.jsx
│       ├── HRMStatusBadge.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── menubar.jsx
│       ├── modal.jsx
│       ├── native-select.jsx
│       ├── navigation-menu.jsx
│       ├── PageHeader.jsx
│       ├── popover.jsx
│       ├── progress.jsx
│       ├── radio-group.jsx
│       ├── radio.jsx
│       ├── RequestDetailModal.jsx
│       ├── responsive-table.jsx
│       ├── scroll-area.jsx
│       ├── select.jsx
│       ├── separator.jsx
│       ├── sheet.jsx
│       ├── skeleton.jsx
│       ├── StatsCard.jsx
│       ├── StatusBadge.jsx
│       ├── switch.jsx
│       ├── table.jsx
│       ├── tabs.jsx
│       ├── textarea.jsx
│       ├── toast.jsx
│       ├── toaster.jsx
│       ├── tooltip.jsx
│       └── UserModal.jsx
├── stores/                        # State management (Zustand)
│   ├── index.js                   # Store exports
│   ├── setupStores.js             # Store configuration
│   ├── storeInitializer.js        # Store initialization
│   ├── useAttendanceSessionStore.js # Attendance session state
│   ├── useAttendanceStore.js      # Attendance state
│   ├── useAuthStore.js            # Authentication state
│   ├── useCalendarStore.js        # Calendar state
│   ├── useDepartmentStore.js      # Department state
│   ├── useEmployeeStore.js        # Employee state
│   ├── useLeaveStore.js           # Leave state
│   ├── useNotificationStore.js    # Notification state
│   ├── useOrganizationStore.js    # Organization state
│   └── useUIStore.js              # UI state
├── styles/                        # Global styles
│   └── responsive.css             # Responsive design styles
└── utils/                         # Utility functions
    ├── attendanceCalculations.js  # Attendance calculations
    ├── attendanceDataMapper.js    # Attendance data mapping
    ├── attendanceStatus.js        # Attendance status utilities
    ├── employeeDataMapper.js      # Employee data mapping
    ├── indianFormatters.js        # Indian locale formatters
    └── locationDeviceCapture.js   # Location/device capture
```

## Key Architecture Patterns

### 1. **Feature-Based Module Architecture**
- Each feature is organized as a self-contained module
- Modules contain their own components, pages, services, and state
- Clear separation of concerns between features

### 2. **Component Composition Pattern**
- Reusable UI components in `/shared/ui`
- Feature-specific components within modules
- Higher-order components for cross-cutting concerns

### 3. **Service Layer Pattern**
- API calls abstracted into service functions
- Consistent error handling and response formatting
- Centralized HTTP client configuration

### 4. **State Management Pattern**
- Zustand for global state management
- Feature-specific stores
- Local component state for UI-only concerns

### 5. **Route Protection Pattern**
- Role-based route protection
- Permission-based component rendering
- Authentication guards

## Directory Responsibilities

### `/core`
- Application infrastructure
- Authentication and authorization
- Layout components
- Core utilities and hooks

### `/modules`
- Feature-based organization
- Business logic components
- Feature-specific state and services

### `/shared`
- Reusable components
- UI component library
- Cross-feature utilities

### `/services`
- API communication layer
- HTTP client configuration
- Response data transformation

### `/stores`
- Global state management
- Feature-specific state stores
- State persistence logic

### `/routes`
- Application routing configuration
- Route protection setup
- Navigation structure

## Technology Stack

- **Framework**: React.js 18+
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **UI Components**: Custom component library
- **Styling**: Tailwind CSS
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Notifications**: React Toastify

## Key Features

- **Role-Based Access Control (RBAC)**
- **Responsive Design**
- **Real-time Notifications**
- **Advanced Calendar System**
- **Employee Self-Service Portal**
- **Admin Management Dashboard**
- **Attendance Tracking**
- **Leave Management**
- **Multi-step Forms**
- **Data Visualization**
- **File Upload/Management**
- **Audit Trail Viewing**

## Development Patterns

### Component Structure
```jsx
// Feature component example
const FeatureComponent = () => {
  // Hooks
  const { user } = useAuth();
  const [state, setState] = useState();
  
  // Event handlers
  const handleAction = () => {};
  
  // Render
  return <div>Component JSX</div>;
};
```

### Service Structure
```javascript
// Service example
class FeatureService {
  async getData(params) {
    const response = await api.get('/endpoint', { params });
    return response.data;
  }
}
```

### Store Structure
```javascript
// Zustand store example
const useFeatureStore = create((set, get) => ({
  data: null,
  loading: false,
  actions: {
    fetchData: async () => {
      set({ loading: true });
      // API call logic
      set({ data, loading: false });
    }
  }
}));
```