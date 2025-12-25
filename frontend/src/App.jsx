import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import {
  ErrorBoundary,
  LoadingSpinner,
} from "./shared/components";
import  ProtectedRoute  from "./core/guards/ProtectedRoute";
import { applyRoutes } from "./routes/applyRoutes";
import { setupZustandStores } from "./stores/setupStores";
import { AttendanceProvider } from "./contexts/AttendanceContext";

import Login from "./modules/auth/pages/Login";
import ForgotPassword from "./modules/auth/pages/ForgotPassword";
import MainLayout from "./core/layout/MainLayout";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import {
  employeeRoutes,
  essRoutes,
  hrRoutes,
  organizationRoutes,
  calendarRoutes,
  adminRoutes,
  dashboardRoutes,
  generalRoutes,
  leadRoutes
} from "./routes";

function App() {
  useEffect(() => {
    // Initialize all Zustand stores
    setupZustandStores();
  }, []);

  return (
    <ErrorBoundary>
      <AttendanceProvider>
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
          />

          <Routes>
            <Route path="/login" element={<Login />} />
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

              {applyRoutes(employeeRoutes)}
              {applyRoutes(essRoutes)}
              {applyRoutes(hrRoutes)}
              {applyRoutes(organizationRoutes)}
              {applyRoutes(calendarRoutes)}
              {applyRoutes(adminRoutes)}
              {applyRoutes(dashboardRoutes)}
              {applyRoutes(generalRoutes)}
              {applyRoutes(leadRoutes)}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AttendanceProvider>
    </ErrorBoundary>
  );
}

export default App;
