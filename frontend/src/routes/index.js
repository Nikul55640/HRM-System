// src/routes/index.js
// Barrel file for all route definitions

// Core route helpers
export { applyRoutes } from "./applyRoutes";

// Feature route groups (used by App.jsx)
export { adminRoutes } from "./adminRoutes";
export { essRoutes } from "./essRoutes";
export { dashboardRoutes } from "./dashboardRoutes";
export { calendarRoutes } from "./calendarRoutes";
export { generalRoutes } from "./generalRoutes";

// Optional / legacy (keep ONLY if still used)
export { organizationRoutes } from "./organizationRoutes";

// ❌ DO NOT EXPORT THESE ANYMORE (intentionally removed)
// employeeRoutes → merged into adminRoutes
// hrRoutes       → merged into adminRoutes
// leadRoutes     → merged into adminRoutes
// routeConfig    → replaced by routeConfig.js (navigation only)

// Navigation & helpers
export {
  moduleRoutes,
  getDefaultRoute,
} from "./routeConfig";
