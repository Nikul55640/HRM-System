import { lazy } from "react";

// Feature 1: Profile & Bank Details Management
const ProfilePage = lazy(() =>
  import("../modules/employee/profile/ProfilePage")
);
const BankDetailsPage = lazy(() =>
  import("../modules/ess/bank/BankDetailsPage")
);

// Feature 2: Attendance Management
const AttendancePage = lazy(() =>
  import("../modules/attendance/employee/AttendancePage")
);

// Feature 3: Leave Management
const LeavePage = lazy(() => import("../modules/leave/employee/LeavePage"));

// Feature 5: Lead Management (Employee)
const EmployeeLeadsPage = lazy(() =>
  import("../modules/employee/pages/LeadsPage")
);

// Feature 6: Shift Management (Employee)
const EmployeeShiftsPage = lazy(() =>
  import("../modules/employee/pages/ShiftsPage")
);

// Feature 7: Calendar & Events (Employee)
const EmployeeCalendarPage = lazy(() =>
  import("../modules/employee/pages/CalendarPage")
);

export const essRoutes = [
  // Feature 1: Profile & Bank Details Management
  { path: "employee/profile", element: <ProfilePage />, roles: ["Employee", "HR", "SuperAdmin"] },
  { path: "employee/bank-details", element: <BankDetailsPage />, roles: ["Employee", "HR", "SuperAdmin"] },
  
  // Feature 2: Attendance Management
  { path: "employee/attendance", element: <AttendancePage />, roles: ["Employee", "HR", "SuperAdmin"] },
  
  // Feature 3: Leave Management
  { path: "employee/leave", element: <LeavePage />, roles: ["Employee", "HR", "SuperAdmin"] },
  
  // Feature 5: Lead Management (Employee)
  { path: "employee/leads", element: <EmployeeLeadsPage />, roles: ["Employee", "HR", "SuperAdmin"] },
  
  // Feature 6: Shift Management (Employee)
  { path: "employee/shifts", element: <EmployeeShiftsPage />, roles: ["Employee", "HR", "SuperAdmin"] },
  
  // Feature 7: Calendar & Events (Employee)
  { path: "employee/calendar", element: <EmployeeCalendarPage />, roles: ["Employee", "HR", "SuperAdmin"] },
];
