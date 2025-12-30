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
  // Profile & Bank Details
  { path: "employee/profile", element: <ProfilePage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },
  { path: "employee/bank-details", element: <BankDetailsPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },

  // Attendance
  { path: "employee/attendance", element: <AttendancePage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },

  // Leave
  { path: "employee/leave", element: <LeavePage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },

  // Leads
  { path: "employee/leads", element: <EmployeeLeadsPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },

  // Shifts
  { path: "employee/shifts", element: <EmployeeShiftsPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },  

  // Calendar
  { path: "employee/calendar", element: <EmployeeCalendarPage />, roles: ["Employee", "HR Administrator", "HR Manager", "SuperAdmin"] },

];
