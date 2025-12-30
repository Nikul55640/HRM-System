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


import Login from "./modules/auth/pages/Login";
import AdminLogin from "./modules/auth/pages/AdminLogin";
import ForgotPassword from "./modules/auth/pages/ForgotPassword";
import MainLayout from "./core/layout/MainLayout";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

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
