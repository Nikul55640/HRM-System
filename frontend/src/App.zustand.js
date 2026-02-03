// App.js - Updated for Zustand
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { setupZustandStores } from './stores/setupStores';
import useAuthStore from './stores/useAuthStore';
import useUIStore from './stores/useUIStore';
import { ROLES } from './core/utils/roles';

// Import your existing components
import Layout from './core/layout';
import LoginPage from './modules/auth/pages/LoginPage';
import ProtectedRoute from './core/guards/ProtectedRoute';
import RoleGate from './core/guards/RoleGate';

// Import pages
import AdminDashboard from './modules/admin/pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './modules/employee/pages/Dashboard/EmployeeDashboard';
import EmployeeList from './modules/employees/pages/EmployeeList';
import EmployeeForm from './modules/employees/pages/EmployeeForm';
import DepartmentSection from './modules/organization/components/DepartmentSection';
import LeaveManagement from './modules/leave/hr/LeaveManagement';
import ManageAttendance from './modules/attendance/admin/ManageAttendance';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useUIStore();

  useEffect(() => {
    // Initialize all Zustand stores
    setupZustandStores();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  if (!isAuthenticated) {
    return (
      <Router>
        <div className={`min-h-screen ${theme}`}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<LoginPage />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${theme}`}>
        <Layout>
          <Routes>
            {/* Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
                    <AdminDashboard />
                  </RoleGate>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.EMPLOYEE]}>
                    <EmployeeDashboard />
                  </RoleGate>
                </ProtectedRoute>
              }
            />

            {/* Employee Management */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
                    <EmployeeList />
                  </RoleGate>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employees/new"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
                    <EmployeeForm />
                  </RoleGate>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employees/:id/edit"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
                    <EmployeeForm />
                  </RoleGate>
                </ProtectedRoute>
              }
            />

            {/* Organization Management */}
            <Route
              path="/organization/departments"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]}>
                    <DepartmentSection />
                  </RoleGate>
                </ProtectedRoute>
              }
            />

            {/* Leave Management */}
            <Route
              path="/leave/management"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
                    <LeaveManagement />
                  </RoleGate>
                </ProtectedRoute>
              }
            />

            {/* Attendance Management */}
            <Route
              path="/attendance/admin"
              element={
                <ProtectedRoute>
                  <RoleGate allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER]}>
                    <ManageAttendance />
                  </RoleGate>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  {user?.systemRole === ROLES.EMPLOYEE || user?.role === 'Employee' ? <EmployeeDashboard /> : <AdminDashboard />}
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </Router>
  );
}

export default App;