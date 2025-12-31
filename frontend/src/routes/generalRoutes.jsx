import { lazy } from "react";

const NotificationsPage = lazy(() =>
  import("../modules/notifications/pages/NotificationsPage")
);

const HelpPage = lazy(() =>
  import("../modules/help/HelpPage")
);

const DebugAuth = lazy(() =>
  import("../pages/DebugAuth")
);

export const generalRoutes = [
  { path: "notifications", element: <NotificationsPage /> },
  { path: "help", element: <HelpPage /> },
  { path: "debug-auth", element: <DebugAuth /> },
];