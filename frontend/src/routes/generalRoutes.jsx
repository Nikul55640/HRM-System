import { lazy } from "react";

const NotificationsPage = lazy(() =>
  import("../modules/notifications/pages/NotificationsPage")
);

const HelpPage = lazy(() =>
  import("../modules/help/HelpPage")
);



export const generalRoutes = [
  { path: "notifications", element: <NotificationsPage /> },
  { path: "help", element: <HelpPage /> },
];