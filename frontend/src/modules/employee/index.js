// Employee module exports

// Pages
export { default as Dashboard } from './pages/Dashboard/Dashboard';
export { default as EmployeeDashboard } from './pages/Dashboard/EmployeeDashboard';

// Services
export { default as dashboardService } from '../../services/dashboardService';
export { default as employeeService } from '../../services/employeeService';

// Store (migrated to Zustand)
// Store exports removed - now using Zustand stores in src/stores/