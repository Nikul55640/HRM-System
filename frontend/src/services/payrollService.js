import api from './api';

const payrollService = {
  // Payslips
  getEmployeePayslips: async (employeeId, params = {}) => {
    const response = await api.get(`/payroll/employees/${employeeId}/payslips`, { params });
    return response.data;
  },

  getPayslip: async (payslipId) => {
    const response = await api.get(`/payroll/payslips/${payslipId}`);
    return response.data;
  },

  downloadPayslip: async (payslipId) => {
    const response = await api.get(`/payroll/payslips/${payslipId}/download`, {
      responseType: 'blob'
    });
    return response;
  },

  // Payroll processing
  processPayroll: async (payrollData) => {
    const response = await api.post('/payroll/process', payrollData);
    return response.data;
  },

  getPayrollRuns: async (params = {}) => {
    const response = await api.get('/payroll/runs', { params });
    return response.data;
  },

  getPayrollRun: async (runId) => {
    const response = await api.get(`/payroll/runs/${runId}`);
    return response.data;
  },

  // Salary components
  getSalaryComponents: async (employeeId) => {
    const response = await api.get(`/payroll/employees/${employeeId}/salary-components`);
    return response.data;
  },

  updateSalaryComponents: async (employeeId, components) => {
    const response = await api.put(`/payroll/employees/${employeeId}/salary-components`, components);
    return response.data;
  },

  // Tax calculations
  calculateTax: async (employeeId, salaryData) => {
    const response = await api.post(`/payroll/employees/${employeeId}/calculate-tax`, salaryData);
    return response.data;
  },

  // Payroll reports
  getPayrollReport: async (params = {}) => {
    const response = await api.get('/payroll/reports', { params });
    return response.data;
  },

  downloadPayrollReport: async (reportType, params = {}) => {
    const response = await api.get(`/payroll/reports/${reportType}/download`, {
      params,
      responseType: 'blob'
    });
    return response;
  },

  // Deductions and allowances
  getDeductions: async (employeeId) => {
    const response = await api.get(`/payroll/employees/${employeeId}/deductions`);
    return response.data;
  },

  updateDeductions: async (employeeId, deductions) => {
    const response = await api.put(`/payroll/employees/${employeeId}/deductions`, deductions);
    return response.data;
  },

  getAllowances: async (employeeId) => {
    const response = await api.get(`/payroll/employees/${employeeId}/allowances`);
    return response.data;
  },

  updateAllowances: async (employeeId, allowances) => {
    const response = await api.put(`/payroll/employees/${employeeId}/allowances`, allowances);
    return response.data;
  }
};

export default payrollService;