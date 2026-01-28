import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect, lazy } from "react";
import { ToastContainer } from "react-toastify";
import {
  ErrorBoundary,
  LoadingSpinner,
} from "./shared/components";
import PerformanceMonitor from "./shared/components/PerformanceMonitor";
import  ProtectedRoute  from "./core/guards/ProtectedRoute";
import { applyRoutes } from "./routes/applyRoutes";
import { setupZustandStores } from "./stores/setupStores";

// Lazy load heavy components
const Login = lazy(() => import("./modules/auth/pages/Login"));
const AdminLogin = lazy(() => import("./modules/auth/pages/AdminLogin"));
const ForgotPassword = lazy(() => import("./modules/auth/pages/ForgotPassword"));
const MainLayout = lazy(() => import("./core/layout/MainLayout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

import {
  essRoutes,
  organizationRoutes,
  calendarRoutes,
  adminRoutes,
  dashboardRoutes,
  generalRoutes
} from "./routes";

function App() {
  useEffect(() => {
    // Initialize all Zustand stores
    setupZustandStores();
  }, []);

  return (
    <ErrorBoundary>
      <PerformanceMonitor />
        <Suspense
          fallback={
            <LoadingSpinner
              size="lg"
              message="Loading application..."
              fullScreen
            />
          }
        >
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            limit={3} // Limit number of toasts
          />

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />  

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              {applyRoutes(essRoutes)}
              {applyRoutes(organizationRoutes)}
              {applyRoutes(calendarRoutes)}
              {applyRoutes(adminRoutes)}
              {applyRoutes(dashboardRoutes)}
              {applyRoutes(generalRoutes)}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
    </ErrorBoundary>
  );
}

export default App;
