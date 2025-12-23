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
const LeavePage = lazy(() => import("../modules/leave/employee/LeavePage"));
const AttendancePage = lazy(() =>
  import("../modules/attendance/employee/AttendancePage")
);

export const essRoutes = [
  { path: "employee/profile", element: <ProfilePage /> },
  { path: "employee/settings", element: <SettingsPage /> },
  { path: "employee/bank-details", element: <BankDetailsPage /> },
  { path: "employee/leave", element: <LeavePage /> },
  { path: "employee/attendance", element: <AttendancePage /> },
];
