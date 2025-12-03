import api from './api';

const payrollService = {
  // Get payroll dashboard data
  getDashboard: async () => {
    try {
      console.log('📊 [PAYROLL SERVICE] Fetching dashboard');
      const response = await api.get('/admin/payroll/dashboard');
      console.log('✅ [PAYROLL SERVICE] Dashboard fetched');
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] Dashboard fetch failed:', error);
      throw error;
    }
  },

  // Get all payslips with filters
  getPayslips: async (params = {}) => {
    try {
      console.log('📋 [PAYROLL SERVICE] Fetching payslips:', params);
      const response = await api.get('/admin/payroll/payslips', { params });
      console.log('✅ [PAYROLL SERVICE] Payslips fetched:', response.data.data?.length);
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] Payslips fetch failed:', error);
      throw error;
    }
  },

  // Get payslip by ID
  getPayslipById: async (payslipId) => {
    try {
      console.log('📄 [PAYROLL SERVICE] Fetching payslip:', payslipId);
      const response = await api.get(`/admin/payroll/payslips/${payslipId}`);
      console.log('✅ [PAYROLL SERVICE] Payslip fetched');
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] Payslip fetch failed:', error);
      throw error;
    }
  },

  // Generate payslips (bulk)
  generatePayslips: async (data) => {
    try {
      console.log('⚙️ [PAYROLL SERVICE] Generating payslips:', data);
      const response = await api.post('/admin/payroll/generate', data);
      console.log('✅ [PAYROLL SERVICE] Payslips generated');
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] Payslip generation failed:', error);
      throw error;
    }
  },

  // Delete payslip
  deletePayslip: async (payslipId) => {
    try {
      console.log('🗑️ [PAYROLL SERVICE] Deleting payslip:', payslipId);
      const response = await api.delete(`/admin/payroll/payslips/${payslipId}`);
      console.log('✅ [PAYROLL SERVICE] Payslip deleted');
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] Payslip deletion failed:', error);
      throw error;
    }
  },

  // Employee: Get own payslips
  getMyPayslips: async (params = {}) => {
    try {
      console.log('📋 [PAYROLL SERVICE] Fetching my payslips');
      const response = await api.get('/employee/payslips', { params });
      console.log('✅ [PAYROLL SERVICE] My payslips fetched');
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] My payslips fetch failed:', error);
      throw error;
    }
  },

  // Employee: Download payslip PDF
  downloadPayslip: async (payslipId) => {
    try {
      console.log('📥 [PAYROLL SERVICE] Downloading payslip:', payslipId);
      const response = await api.get(`/employee/payslips/${payslipId}/download`, {
        responseType: 'blob'
      });
      console.log('✅ [PAYROLL SERVICE] Payslip downloaded');
      return response.data;
    } catch (error) {
      console.error('❌ [PAYROLL SERVICE] Payslip download failed:', error);
      throw error;
    }
  }
};

export default payrollService;
