import { lazy } from "react";

const NotificationsPage = lazy(() =>
  import("../modules/notifications/pages/NotificationsPage")
);

export const generalRoutes = [
  { path: "notifications", element: <NotificationsPage /> },
];