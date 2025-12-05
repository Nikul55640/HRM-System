import { Routes, Route } from "react-router-dom";
import EmployeeDashboard from "../../features/dashboard/EmployeeDashboard.jsx";
import ProfilePage from "../../employee/profile/profile/ProfilePage.jsx";
import PayslipsPage from "../../../employee/payroll/PayslipsPage.jsx";
import LeavePage from "../../../employee/leave/LeavePage.jsx";
import AttendancePage from "../../../employee/attendance/AttendancePage.jsx";
import RequestsPage from "../../../../components/employee-self-service/requests/RequestsPage.jsx";
import DocumentsPage from "../../../employee/documents/DocumentsPage.jsx";
import BankDetailsPage from "../../../../components/employee-self-service/bank/BankDetailsPage.jsx";

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
