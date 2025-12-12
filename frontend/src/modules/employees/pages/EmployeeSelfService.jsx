import { Routes, Route } from "react-router-dom";
import EmployeeDashboard from "../../employee/pages/Dashboard/EmployeeDashboard.jsx";
import ProfilePage from "../../employee/profile/ProfilePage.jsx";
import PayslipsPage from "../../payroll/employee/PayslipsPage.jsx";
import LeavePage from "../../leave/employee/LeavePage.jsx";
import AttendancePage from "../../attendance/employee/AttendancePage.jsx";
import RequestsPage from "../../ess/requests/RequestsPage.jsx";
import DocumentsPage from "../../documents/pages/DocumentList.jsx";
import BankDetailsPage from "../../ess/bank/BankDetailsPage.jsx";

const EmployeeSelfService = () => {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/payslips" element={<PayslipsPage />} />
      <Route path="/leave/*" element={<LeavePage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/requests/*" element={<RequestsPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/bank-details" element={<BankDetailsPage />} />
    </Routes>
  );
};

export default EmployeeSelfService;
