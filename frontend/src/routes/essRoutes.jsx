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
  { path: "profile", element: <ProfilePage /> },
  { path: "settings", element: <SettingsPage /> },
  { path: "bank-details", element: <BankDetailsPage /> },
  { path: "payslips", element: <PayslipsPage /> },
  { path: "leave", element: <LeavePage /> },
  { path: "attendance", element: <AttendancePage /> },
  { path: "documents", element: <DocumentsPage /> },
  { path: "requests", element: <RequestsPage /> },
];
