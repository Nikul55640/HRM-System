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
const AttendanceCorrectionRequests = lazy(() =>
  import("../modules/attendance/employee/AttendanceCorrectionRequests")
);

// Feature 3: Leave Management
const LeavePage = lazy(() => import("../modules/leave/employee/LeavePage"));

// Feature 4: Employee Settings
const EmployeeSettings = lazy(() =>
  import("../modules/employee/settings/pages/EmployeeSettings")
);
const ProfileSettings = lazy(() =>
  import("../modules/employee/settings/pages/ProfileSettings")
);
const SecuritySettings = lazy(() =>
  import("../modules/employee/settings/pages/SecuritySettings")
);
const EmergencyContacts = lazy(() =>
  import("../modules/employee/settings/pages/EmergencyContacts")
);

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
  import("../modules/calendar/employee/EmployeeCalendarPage")
);


export const essRoutes = [
  // Profile & Bank Details - Employee only (HR manages through admin pages)
  { path: "employee/profile", element: <ProfilePage />, roles: ["Employee"] },
  { path: "employee/bank-details", element: <BankDetailsPage />, roles: ["Employee"] },

  // Employee Settings - Employee only
  { path: "employee/settings", element: <EmployeeSettings />, roles: ["Employee"] },
  { path: "employee/settings/profile", element: <ProfileSettings />, roles: ["Employee"] },
  { path: "employee/settings/security", element: <SecuritySettings />, roles: ["Employee"] },
  { path: "employee/settings/emergency-contacts", element: <EmergencyContacts />, roles: ["Employee"] },

  // Attendance - Employee only (HR uses admin attendance pages)
  { path: "employee/attendance", element: <AttendancePage />, roles: ["Employee"] },
  { path: "employee/attendance/corrections", element: <AttendanceCorrectionRequests />, roles: ["Employee"] },

  // Leave - Employee only (HR uses admin leave pages)
  { path: "employee/leave", element: <LeavePage />, roles: ["Employee"] },

  // Leads - Employee only (HR uses admin lead pages)
  { path: "employee/leads", element: <EmployeeLeadsPage />, roles: ["Employee"] },

  // Shifts - Employee only (HR uses admin shift pages)
  { path: "employee/shifts", element: <EmployeeShiftsPage />, roles: ["Employee"] },  
 
  // Calendar - Employee only (HR uses admin calendar pages)
  { path: "employee/calendar", element: <EmployeeCalendarPage />, roles: ["Employee"] },

];
