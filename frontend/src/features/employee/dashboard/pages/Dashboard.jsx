import EmployeeDashboard  from "./EmployeeDashboard";
import AdminDashboard from "../../../admin/dashboard/pages/AdminDashboard";
import useAuth from "../../../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  // Show admin dashboard for SuperAdmin and HR roles
  if (
    user?.role === "SuperAdmin" ||
    user?.role === "HR Manager" ||
    user?.role === "HR Administrator"
  ) {
    return <AdminDashboard />;
  }

  // Show employee dashboard for regular employees
  return <EmployeeDashboard />;
};

export default Dashboard;
