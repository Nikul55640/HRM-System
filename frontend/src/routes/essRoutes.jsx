import { lazy } from "react";

const ProfilePage = lazy(() =>
  import("../modules/employee/profile/ProfilePage")
);
const SettingsPage = lazy(() =>
  import("../modules/employee/pages/Settings/SettingsPage")
);
const BankDetailsPage = lazy(() =>
  import("../modules/ess/bank/BankDetailsPage")
);
const PayslipsPage = lazy(() =>
  import("../modules/payroll/employee/PayslipsPage")
);
const LeavePage = lazy(() => import("../modules/leave/employee/LeavePage"));
const AttendancePage = lazy(() =>
  import("../modules/attendance/employee/AttendancePage")
);
const DocumentsPage = lazy(() =>
  import("../modules/documents/pages/DocumentList")
);
const RequestsPage = lazy(() =>
  import("../modules/ess/requests/RequestsPage")
);

export const essRoutes = [
  { path: "employee/profile", element: <ProfilePage /> },
  { path: "employee/settings", element: <SettingsPage /> },
  { path: "employee/bank-details", element: <BankDetailsPage /> },
  { path: "employee/payslips", element: <PayslipsPage /> },
  { path: "employee/leave", element: <LeavePage /> },
  { path: "employee/attendance", element: <AttendancePage /> },
  { path: "employee/documents", element: <DocumentsPage /> },
  { path: "employee/requests", element: <RequestsPage /> },
];
