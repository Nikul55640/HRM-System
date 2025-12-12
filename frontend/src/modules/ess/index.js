// ESS (Employee Self Service) module exports

// New restructured components
export { default as BankDetailsForm } from './components/BankDetails';
export { default as PayslipHistory } from './components/PayslipHistory';
export { default as LeaveBalance } from './components/LeaveBalance';
export { default as AttendanceHistory } from './components/AttendanceHistory';
export { default as ProfileSettings } from './components/ProfileSettings';

// Legacy bank components (keep for backward compatibility)
export { default as BankDetailsView } from './bank/BankDetailsView';
export { default as BankDetailsPage } from './bank/BankDetailsPage';

// Services
export { default as employeeSelfService } from '../../services/employeeSelfService';

