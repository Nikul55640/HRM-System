import { lazy } from "react";

const ProfilePage = lazy(() =>
  import("../features/employee/profile/ProfilePage")
);
const BankDetailsPage = lazy(() =>
  import("../components/employee-self-service/bank/BankDetailsPage")
);
const PayslipsPage = lazy(() =>
  import("../features/employee/payroll/PayslipsPage")
);
const LeavePage = lazy(() => import("../features/leave/pages/LeavePage"));
const AttendancePage = lazy(() =>
  import("../features/employee/attendance/AttendancePage")
);
const DocumentsPage = lazy(() =>
  import("../features/employee/documents/DocumentsPage")
);
const RequestsPage = lazy(() =>
  import("../components/employee-self-service/requests/RequestsPage")
);

export const essRoutes = [
  { path: "profile", element: ProfilePage },
  { path: "bank-details", element: BankDetailsPage },
  { path: "payslips", element: PayslipsPage },
  { path: "leave", element: LeavePage },
  { path: "attendance", element: AttendancePage },
  { path: "documents", element: DocumentsPage },
  { path: "requests", element: RequestsPage },
];
