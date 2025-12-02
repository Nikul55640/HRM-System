import { lazy } from "react";

const ProfilePage = lazy(() => import("../features/ess/profile/ProfilePage"));
const BankDetailsPage = lazy(() =>
  import("../components/employee-self-service/bank/BankDetailsPage")
);
const PayslipsPage = lazy(() => import("../features/ess/payslips/PayslipsPage"));
const LeavePage = lazy(() => import("../features/ess/leave/LeavePage"));
const AttendancePage = lazy(() =>
  import("../features/ess/attendance/AttendancePage")
);
const DocumentsPage = lazy(() =>
  import("../features/ess/documents/DocumentsPage")
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
