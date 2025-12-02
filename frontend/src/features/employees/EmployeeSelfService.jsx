import { Routes, Route } from 'react-router-dom';
import EmployeeDashboard from '../../features/dashboard/EmployeeDashboard.jsx';
import ProfilePage from '../ess/profile/ProfilePage.jsx';
import PayslipsPage from '../../features/ess/payslips/PayslipsPage.jsx';
import LeavePage from '../../features/ess/leave/LeavePage.jsx';
import AttendancePage from '../../features/ess/attendance/AttendancePage.jsx';
import RequestsPage from '../../components/employee-self-service/requests/RequestsPage.jsx';
import DocumentsPage from '../../features/ess/documents/DocumentsPage.jsx';
import BankDetailsPage from '../../components/employee-self-service/bank/BankDetailsPage.jsx';

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
