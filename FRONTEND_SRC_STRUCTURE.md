# Frontend Source Structure

## Overview
This document outlines the complete structure of the HRM System frontend source code, built with React.js and following modern frontend architecture patterns.

```
frontend/src/
├── App.jsx                         # Main application component (90 lines)
├── App.zustand.js                  # Zustand store configuration (192 lines)
├── main.jsx                        # Application entry point (14 lines)
├── index.css                       # Global styles
├── components/                     # Global components
│   ├── NotificationBell.jsx       # Global notification component (303 lines)
│   └── ViewTestComponent.jsx      # View test component (198 lines)
├── core/                          # Core application infrastructure
│   ├── guards/                    # Route protection and access control
│   │   ├── index.js (3 lines)
│   │   ├── PermissionGate.jsx     # Permission-based component rendering (56 lines)
│   │   ├── ProtectedRoute.jsx     # Route-level protection (50 lines)
│   │   └── RoleGate.jsx           # Role-based component rendering (36 lines)
│   ├── hooks/                     # Core custom hooks
│   │   ├── index.js (3 lines)
│   │   ├── use-toast.js           # Toast notification hook (155 lines)
│   │   ├── useAuth.js             # Authentication hook (71 lines)
│   │   └── usePermissions.js      # Permission checking hook (94 lines)
│   ├── layout/                    # Application layout components
│   │   ├── index.js (6 lines)
│   │   ├── Footer.jsx             # Application footer (15 lines)
│   │   ├── Header.jsx             # Application header (259 lines)
│   │   ├── MainLayout.jsx         # Main layout wrapper (48 lines)
│   │   └── Sidebar.jsx            # Navigation sidebar (654 lines)
│   └── utils/                     # Core utility functions
│       ├── calendarEventTypes.js  # Calendar event type definitions (204 lines)
│       ├── errorHandler.js        # Global error handling (179 lines)
│       └── rolePermissions.js     # Role permission utilities (391 lines)
├── Debug/                         # Debug utilities (empty)
├── hooks/                         # Application-specific hooks
│   └── useNotifications.js        # Notification management hook (114 lines)
├── lib/                           # Third-party library configurations
│   ├── date-utils.js              # Date manipulation utilities (161 lines)
│   └── utils.js                   # General utility functions (137 lines)
├── modules/                       # Feature-based modules
│   ├── admin/                     # Admin module
│   │   └── pages/                 # Admin pages
│   │       ├── Announcements/
│   │       │   └── AnnouncementsPage.jsx (373 lines)
│   │       ├── Auditlogs/
│   │       │   └── AuditLogsPage.jsx (595 lines)
│   │       ├── BankVerification/
│   │       │   └── BankVerificationPage.jsx (456 lines)
│   │       ├── Dashboard/
│   │       │   └── AdminDashboard.jsx (320 lines)
│   │       ├── Departments/
│   │       │   └── DepartmentsPage.jsx (705 lines)
│   │       ├── Designations/
│   │       │   └── DesignationsPage.jsx (572 lines)
│   │       └── Settings/
│   │           └── AdminSettingsPage.jsx (913 lines)
│   ├── attendance/                # Attendance management module
│   │   ├── index.js (18 lines)
│   │   ├── admin/                 # Admin attendance features
│   │   │   ├── AttendanceCorrections.jsx (521 lines)
│   │   │   ├── LiveAttendanceDashboard.jsx (512 lines)
│   │   │   ├── ManageAttendance.jsx (603 lines)
│   │   │   └── AttendanceViewModal.jsx (287 lines)
│   │   ├── components/            # Shared attendance components
│   │   │   ├── AttendanceForm.jsx (416 lines)
│   │   │   └── ShiftStatusWidget.jsx (373 lines)
│   │   └── employee/              # Employee attendance features
│   │       ├── AttendancePage.jsx (295 lines)
│   │       ├── AttendanceSummary.jsx (395 lines)
│   │       ├── AttendanceCorrectionRequests.jsx (411 lines)
│   │       ├── AttendanceStatsWidget.jsx (77 lines)
│   │       ├── EnhancedClockInOut.jsx (747 lines)
│   │       ├── LocationSelectionModal.jsx (337 lines)
│   │       └── SessionHistoryView.jsx (318 lines)
│   ├── auth/                      # Authentication module
│   │   ├── index.js (3 lines)
│   │   └── pages/
│   │       ├── AdminLogin.jsx (199 lines)
│   │       ├── Login.jsx (199 lines)
│   │       └── ForgotPassword.jsx (119 lines)
│   ├── calendar/                  # Calendar management module
│   │   ├── index.js (10 lines)
│   │   ├── README.md
│   │   ├── admin/                 # Admin calendar features
│   │   │   ├── CalendarManagement.jsx (280 lines)
│   │   │   ├── CalendarificManagement.jsx (742 lines)
│   │   │   ├── SmartCalendarManagement.jsx (958 lines)
│   │   │   ├── WorkingRuleForm.jsx (254 lines)
│   │   │   ├── HolidayForm.jsx (0 lines)
│   │   │   ├── components/
│   │   │   │   ├── ApiStatusCard.jsx (115 lines)
│   │   │   │   ├── CountryYearSelector.jsx (53 lines)
│   │   │   │   ├── HolidayPreviewList.jsx (60 lines)
│   │   │   │   └── HolidayTypeSelector.jsx (112 lines)
│   │   │   └── constants/
│   │   │       └── holidayTypes.js (35 lines)
│   │   ├── components/            # Shared calendar components
│   │   │   ├── CalendarCell.jsx (297 lines)
│   │   │   ├── CalendarFilters.jsx (194 lines)
│   │   │   ├── CalendarGrid.jsx (144 lines)
│   │   │   ├── CalendarSidebar.jsx (307 lines)
│   │   │   ├── DayDetailModal.jsx (23 lines)
│   │   │   ├── EventModal.jsx (287 lines)
│   │   │   └── UnifiedCalendarView.jsx (915 lines)
│   │   ├── employee/              # Employee calendar features
│   │   │   ├── DayEventsDrawer.jsx (130 lines)
│   │   │   ├── EmployeeCalendarPage.jsx (257 lines)
│   │   │   ├── EmployeeCalendarToolbar.jsx (132 lines)
│   │   │   ├── EmployeeCalendarView.jsx (57 lines)
│   │   │   └── views/
│   │   │       ├── MonthView.jsx (403 lines)
│   │   │       ├── WeekView.jsx (411 lines)
│   │   │       └── TodayView.jsx (186 lines)
│   │   ├── pages/                 # Calendar pages
│   │   │   └── CalendarView.jsx (20 lines)
│   │   └── stores/                # Calendar state management
│   ├── employee/                  # Employee self-service module
│   │   ├── index.js (12 lines)
│   │   ├── pages/                 # Employee pages
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx (27 lines)
│   │   │   │   └── EmployeeDashboard.jsx (1981 lines)
│   │   │   ├── LeadsPage.jsx (476 lines)
│   │   │   └── ShiftsPage.jsx (276 lines)
│   │   ├── profile/               # Employee profile management
│   │   │   └── ProfilePage.jsx (341 lines)
│   │   └── settings/              # Employee settings
│   │       ├── index.js (19 lines)
│   │       ├── components/
│   │       │   ├── ContactInfoForm.jsx (235 lines)
│   │       │   ├── EmergencyContactForm.jsx (222 lines)
│   │       │   ├── PasswordChangeForm.jsx (226 lines)
│   │       │   ├── PersonalInfoForm.jsx (241 lines)
│   │       │   └── ProfilePhotoUploader.jsx (251 lines)
│   │       ├── pages/
│   │       │   ├── EmergencyContacts.jsx (397 lines)
│   │       │   ├── EmployeeSettings.jsx (197 lines)
│   │       │   ├── ProfileSettings.jsx (150 lines)
│   │       │   └── SecuritySettings.jsx (80 lines)
│   │       ├── schemas/
│   │       │   ├── emergencyContact.schema.js (34 lines)
│   │       │   ├── password.schema.js (19 lines)
│   │       │   └── profile.schema.js (83 lines)
│   │       └── services/
│   │           └── employeeSettingsService.js (115 lines)
│   ├── employees/                 # Employee management module
│   │   ├── index.js (25 lines)
│   │   ├── components/            # Employee management components
│   │   │   ├── ActivityTab.jsx (273 lines)
│   │   │   ├── EmployeeCard.jsx (126 lines)
│   │   │   ├── EmployeeTable.jsx (128 lines)
│   │   │   └── OverviewTab.jsx (118 lines)
│   │   ├── form-steps/            # Multi-step employee forms
│   │   │   ├── ContactInfoStep.jsx (235 lines)
│   │   │   ├── JobDetailsStep.jsx (226 lines)
│   │   │   ├── PersonalInfoStep.jsx (136 lines)
│   │   │   └── SystemAccessStep.jsx (124 lines)
│   │   ├── pages/                 # Employee management pages
│   │   │   ├── EmployeeForm.jsx (561 lines)
│   │   │   ├── EmployeeList.jsx (399 lines)
│   │   │   ├── EmployeeProfile.jsx (281 lines)
│   │   │   └── NoEmployeeProfile.jsx (191 lines)
│   │   └── services/              # Employee management services
│   │       └── employeeService.js (176 lines)
│   ├── ess/                       # Employee Self-Service module
│   │   ├── bank/                  # Bank details management
│   │   │   └── BankDetailsPage.jsx (293 lines)
│   │   ├── utils/                 # ESS utilities
│   │   │   └── essHelpers.js (281 lines)
│   │   └── validation/            # ESS validation schemas
│   │       └── essValidation.js (116 lines)
│   ├── help/                      # Help and support module
│   │   └── HelpPage.jsx (430 lines)
│   ├── leads/                     # Lead management module
│   │   ├── index.js (5 lines)
│   │   ├── components/
│   │   │   ├── ActivityForm.jsx (218 lines)
│   │   │   ├── LeadDetails.jsx (408 lines)
│   │   │   ├── LeadForm.jsx (380 lines)
│   │   │   └── NoteForm.jsx (103 lines)
│   │   └── pages/
│   │       └── LeadManagement.jsx (483 lines)
│   ├── leave/                     # Leave management module
│   │   ├── index.js (18 lines)
│   │   ├── Admin/                 # Admin leave features
│   │   │   ├── index.js (3 lines)
│   │   │   ├── LeaveBalancesPage.jsx (527 lines)
│   │   │   ├── LeaveBalanceRolloverPage.jsx (312 lines)
│   │   │   └── LeaveBalancesPage.test.jsx (130 lines)
│   │   ├── components/            # Shared leave components
│   │   │   ├── LeaveApplicationForm.jsx (181 lines)
│   │   │   ├── LeaveBalanceCards.jsx (212 lines)
│   │   │   ├── LeaveBalanceWidget.jsx (234 lines)
│   │   │   └── LeaveHistoryTable.jsx (228 lines)
│   │   ├── employee/              # Employee leave features
│   │   │   ├── LeaveBalanceCard.jsx (128 lines)
│   │   │   ├── LeavePage.jsx (466 lines)
│   │   │   └── LeaveRequestModal.jsx (343 lines)
│   │   ├── hooks/                 # Leave-specific hooks
│   │   │   └── useLeaveBalance.js (134 lines)
│   │   └── hr/                    # HR leave features
│   │       └── LeaveManagement.jsx (457 lines)
│   ├── notifications/             # Notification module
│   │   └── pages/
│   │       └── NotificationsPage.jsx (398 lines)
│   ├── organization/              # Organization management module
│   │   ├── index.js (4 lines)
│   │   ├── admin/                 # Admin organization features
│   │   │   ├── CustomFieldsSection.jsx (346 lines)
│   │   │   ├── SystemConfig.jsx (79 lines)
│   │   │   └── UserManagement.jsx (297 lines)
│   │   ├── components/            # Organization components
│   │   │   ├── DepartmentModal.jsx (238 lines)
│   │   │   ├── DepartmentSection.jsx (149 lines)
│   │   │   ├── DepartmentTable.jsx (94 lines)
│   │   │   ├── DesignationModal.jsx (154 lines)
│   │   │   ├── DesignationTable.jsx (105 lines)
│   │   │   ├── DocumentList.jsx (136 lines)
│   │   │   ├── DocumentUpload.jsx (189 lines)
│   │   │   ├── HolidayModal.jsx (689 lines)
│   │   │   ├── HolidayTable.jsx (126 lines)
│   │   │   ├── PolicyModal.jsx (308 lines)
│   │   │   └── PolicyTable.jsx (147 lines)
│   │   └── pages/                 # Organization pages
│   │       ├── CompanyDocumentsPage.jsx (77 lines)
│   │       └── PolicyPage.jsx (91 lines)
│   └── Shift/                     # Shift management module
│       └── admin/                 # Admin shift features
│           ├── AssignShiftForm.jsx (267 lines)
│           ├── ShiftDetails.jsx (280 lines)
│           ├── ShiftForm.jsx (501 lines)
│           └── ShiftManagement.jsx (410 lines)
├── pages/                         # Global pages
│   ├── NotFound.jsx               # 404 error page (45 lines)
│   └── Unauthorized.jsx           # 403 error page (45 lines)
├── routes/                        # Application routing
│   ├── index.js                   # Route configuration (27 lines)
│   ├── routeConfig.js             # Route definitions (42 lines)
│   ├── adminRoutes.jsx            # Admin routes (106 lines)
│   ├── applyRoutes.jsx            # Application routes (18 lines)
│   ├── calendarRoutes.jsx         # Calendar routes (9 lines)
│   ├── dashboardRoutes.jsx        # Dashboard routes (17 lines)
│   ├── essRoutes.jsx              # ESS routes (79 lines)
│   ├── generalRoutes.jsx          # General routes (16 lines)
│   └── organizationRoutes.jsx     # Organization routes (16 lines)
├── services/                      # API service layer
│   ├── index.js                   # Service exports (29 lines)
│   ├── README.md                  # Service documentation
│   ├── api.js                     # Base API configuration (241 lines)
│   ├── adminDashboardService.js   # Admin dashboard API (168 lines)
│   ├── adminLeaveService.js       # Admin leave API (415 lines)
│   ├── announcementService.js     # Announcement API (114 lines)
│   ├── attendanceService.js       # Attendance API (264 lines)
│   ├── auditLogService.js         # Audit log API (95 lines)
│   ├── authService.js             # Authentication API (57 lines)
│   ├── birthdayService.js         # Birthday API (403 lines)
│   ├── calendarificService.js     # Calendarific integration (330 lines)
│   ├── calendarService.js         # Calendar API (354 lines)
│   ├── calendarViewService.js     # Calendar view API (85 lines)
│   ├── configService.js           # Configuration API (217 lines)
│   ├── dashboardService.js        # Dashboard API (89 lines)
│   ├── departmentService.js       # Department API (82 lines)
│   ├── employeeCalendarService.js # Employee calendar API (463 lines)
│   ├── employeeDashboardService.js # Employee dashboard API (315 lines)
│   ├── employeeManagementService.js # Employee management API (189 lines)
│   ├── employeeSelfService.js     # Employee self-service API (299 lines)
│   ├── employeeService.js         # Employee API (61 lines)
│   ├── helpSupportService.js      # Help support API (57 lines)
│   ├── hrmApiService.js           # HRM API (228 lines)
│   ├── leaveService.js            # Leave API (158 lines)
│   ├── leaveTypeService.js        # Leave type API (44 lines)
│   ├── managerService.js          # Manager API (180 lines)
│   ├── notificationService.js     # Notification API (345 lines)
│   ├── payrollService.js          # Payroll API (91 lines)
│   ├── recentActivityService.js   # Recent activity API (237 lines)
│   ├── shiftService.js            # Shift API (160 lines)
│   ├── smartCalendarService.js    # Smart calendar API (319 lines)
│   ├── useEmployeeSelfService.js  # ESS hook service (611 lines)
│   └── userService.js             # User API (114 lines)
├── shared/                        # Shared components and utilities
│   ├── components/                # Reusable components
│   │   ├── index.js (12 lines)
│   │   ├── ApprovalStatusBadge.jsx (29 lines)
│   │   ├── AttendanceStatusBadge.jsx (66 lines)
│   │   ├── DetailModal.jsx (236 lines)
│   │   ├── EmptyState.jsx (37 lines)
│   │   ├── ErrorBoundary.jsx (72 lines)
│   │   ├── Icon.jsx (226 lines)
│   │   ├── LoadingSpinner.jsx (25 lines)
│   │   ├── NotificationManager.jsx (81 lines)
│   │   ├── Pagination.jsx (131 lines)
│   │   ├── QuickPreview.jsx (140 lines)
│   │   ├── ScopeIndicator.jsx (36 lines)
│   │   └── SkeletonLoader.jsx (115 lines)
│   └── ui/                        # UI component library
│       ├── index.js (29 lines)
│       ├── ActionButton.jsx (58 lines)
│       ├── alert-dialog.jsx (100 lines)
│       ├── alert.jsx (42 lines)
│       ├── avatar.jsx (33 lines)
│       ├── badge.jsx (55 lines)
│       ├── button.jsx (47 lines)
│       ├── calendar.jsx (62 lines)
│       ├── card.jsx (50 lines)
│       ├── checkbox.jsx (31 lines)
│       ├── DataCard.jsx (57 lines)
│       ├── DeleteConfirmModal.jsx (161 lines)
│       ├── DetailModal.jsx (81 lines)
│       ├── dialog.jsx (96 lines)
│       ├── dropdown-menu.jsx (158 lines)
│       ├── EmptyState.jsx (42 lines)
│       ├── FilterBar.jsx (75 lines)
│       ├── form.jsx (138 lines)
│       ├── hover-card.jsx (26 lines)
│       ├── HRMCard.jsx (178 lines)
│       ├── HRMStatusBadge.jsx (31 lines)
│       ├── input.jsx (19 lines)
│       ├── label.jsx (16 lines)
│       ├── menubar.jsx (199 lines)
│       ├── modal.jsx (82 lines)
│       ├── native-select.jsx (29 lines)
│       ├── navigation-menu.jsx (105 lines)
│       ├── PageHeader.jsx (64 lines)
│       ├── popover.jsx (26 lines)
│       ├── progress.jsx (57 lines)
│       ├── radio-group.jsx (30 lines)
│       ├── radio.jsx (34 lines)
│       ├── RequestDetailModal.jsx (230 lines)
│       ├── responsive-table.jsx (207 lines)
│       ├── scroll-area.jsx (41 lines)
│       ├── select.jsx (167 lines)
│       ├── separator.jsx (24 lines)
│       ├── sheet.jsx (110 lines)
│       ├── skeleton.jsx (11 lines)
│       ├── StatsCard.jsx (83 lines)
│       ├── StatusBadge.jsx (63 lines)
│       ├── switch.jsx (32 lines)
│       ├── table.jsx (89 lines)
│       ├── tabs.jsx (74 lines)
│       ├── textarea.jsx (18 lines)
│       ├── toast.jsx (83 lines)
│       ├── toaster.jsx (33 lines)
│       ├── tooltip.jsx (46 lines)
│       └── UserModal.jsx (267 lines)
├── stores/                        # State management (Zustand)
│   ├── index.js                   # Store exports (11 lines)
│   ├── setupStores.js             # Store configuration (36 lines)
│   ├── storeInitializer.js        # Store initialization (77 lines)
│   ├── useAttendanceSessionStore.js # Attendance session state (334 lines)
│   ├── useAttendanceStore.js      # Attendance state (369 lines)
│   ├── useAuthStore.js            # Authentication state (261 lines)
│   ├── useCalendarStore.js        # Calendar state (283 lines)
│   ├── useDepartmentStore.js      # Department state (319 lines)
│   ├── useEmployeeStore.js        # Employee state (256 lines)
│   ├── useLeaveStore.js           # Leave state (217 lines)
│   ├── useNotificationStore.js    # Notification state (110 lines)
│   ├── useOrganizationStore.js    # Organization state (271 lines)
│   └── useUIStore.js              # UI state (95 lines)
├── styles/                        # Global styles
│   └── responsive.css             # Responsive design styles
└── utils/                         # Utility functions
    ├── attendanceCalculations.js  # Attendance calculations (209 lines)
    ├── attendanceDataMapper.js    # Attendance data mapping (164 lines)
    ├── attendanceStatus.js        # Attendance status utilities (204 lines)
    ├── employeeDataMapper.js      # Employee data mapping (130 lines)
    ├── indianFormatters.js        # Indian locale formatters (238 lines)
    └── locationDeviceCapture.js   # Location/device capture (232 lines)
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