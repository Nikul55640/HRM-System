import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "../../../admin/pages/Dashboard/AdminDashboard";
import useAuth from "../../../../core/hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  console.log('📊 [DASHBOARD] Dashboard component rendered');
  console.log('📊 [DASHBOARD] User data:', user);
  console.log('📊 [DASHBOARD] User role:', user?.role);

  // Show admin dashboard for SuperAdmin and HR roles
  if (
    user?.role === "SuperAdmin" ||
    user?.role === "HR Administrator" ||
    user?.role === "HR Manager"
  ) {
    console.log('📊 [DASHBOARD] Showing AdminDashboard for role:', user.role);
    return <AdminDashboard />;
  }

  // Show employee dashboard for regular employees
  console.log('📊 [DASHBOARD] Showing EmployeeDashboard for role:', user?.role);
  return <EmployeeDashboard />;
};

export default Dashboard;