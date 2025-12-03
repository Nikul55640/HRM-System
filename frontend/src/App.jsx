import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { ProtectedRoute } from "./components/common";
import { applyRoutes } from "./routes/applyRoutes";

import Login from "./features/auth/Login";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

import {
  employeeRoutes,
  essRoutes,
  hrRoutes,
  managerRoutes,
  organizationRoutes,
  payrollRoutes,
  calendarRoutes,
  adminRoutes,
  dashboardRoutes,
} from "./routes";

function App() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
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
          {applyRoutes(managerRoutes)}
          {applyRoutes(organizationRoutes)}
          {applyRoutes(payrollRoutes)}
          {applyRoutes(calendarRoutes)}
          {applyRoutes(adminRoutes)}
          {applyRoutes(dashboardRoutes)}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
