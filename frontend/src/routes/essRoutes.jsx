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

// API Test Runner
const APITestRunner = lazy(() =>
  import("../components/APITestRunner")
);

export const essRoutes = [
  // Feature 1: Profile & Bank Details Management
  { path: "employee/profile", element: <ProfilePage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "employee/bank-details", element: <BankDetailsPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  
  // Feature 2: Attendance Management
  { path: "employee/attendance", element: <AttendancePage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  
  // Feature 3: Leave Management
  { path: "employee/leave", element: <LeavePage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  
  // Feature 5: Lead Management (Employee)
  { path: "employee/leads", element: <EmployeeLeadsPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  
  // Feature 6: Shift Management (Employee)
  { path: "employee/shifts", element: <EmployeeShiftsPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  
  // Feature 7: Calendar & Events (Employee)
  { path: "employee/calendar", element: <EmployeeCalendarPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  
  // API Test Runner
  { path: "api-test", element: <APITestRunner />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
];
