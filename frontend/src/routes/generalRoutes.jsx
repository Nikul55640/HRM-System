import { lazy } from "react";

const NotificationsPage = lazy(() =>
  import("../modules/notifications/pages/NotificationsPage")
);
const HelpPage = lazy(() =>
  import("../modules/help/pages/HelpPage")
);
const ReportsPage = lazy(() =>
  import("../modules/reports/pages/ReportsPage")
);
const SettingsPage = lazy(() =>
  import("../modules/settings/pages/SettingsPage")
);

export const generalRoutes = [
  { path: "notifications", element: <NotificationsPage /> },
  { path: "help", element: <HelpPage /> },
  { path: "reports", element: <ReportsPage />, roles: ["HR Manager", "SuperAdmin"] },
  { path: "settings", element: <SettingsPage /> },
  
];