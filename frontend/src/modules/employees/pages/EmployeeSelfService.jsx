import { Routes, Route } from "react-router-dom";
import EmployeeDashboard from "../../employee/pages/Dashboard/EmployeeDashboard.jsx";
import ProfilePage from "../../employee/profile/ProfilePage.jsx";
import LeavePage from "../../leave/employee/LeavePage.jsx";
import AttendancePage from "../../attendance/employee/AttendancePage.jsx";
import BankDetailsPage from "../../ess/bank/BankDetailsPage.jsx";

const EmployeeSelfService = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/leave/*" element={<LeavePage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/bank-details" element={<BankDetailsPage />} />
    </Routes>
  );
};

export default EmployeeSelfService;
