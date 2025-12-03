import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  fetchPayslipsStart,
  fetchPayslipsSuccess,
  fetchPayslipsFailure,
  fetchPayslipStart,
  fetchPayslipSuccess,
  fetchPayslipFailure,
  generatePayslipsStart,
  generatePayslipsSuccess,
  generatePayslipsFailure
} from '../slices/payrollSlice';
import payrollService from '../../services/payrollService';

// Fetch payroll dashboard
export const fetchPayrollDashboard = createAsyncThunk(
  'payroll/fetchDashboard',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(fetchDashboardStart());
      console.log('📊 [PAYROLL THUNK] Fetching dashboard');
      
      const response = await payrollService.getDashboard();
      
      if (response.success) {
        dispatch(fetchDashboardSuccess(response.data));
        console.log('✅ [PAYROLL THUNK] Dashboard fetched successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard');
      }
    } catch (error) {
      console.error('❌ [PAYROLL THUNK] Dashboard fetch failed:', error);
      const errorMessage = error.message || 'Failed to fetch payroll dashboard';
      dispatch(fetchDashboardFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch payslips list
export const fetchPayslips = createAsyncThunk(
  'payroll/fetchPayslips',
  async (params = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(fetchPayslipsStart());
      console.log('📋 [PAYROLL THUNK] Fetching payslips:', params);
      
      const response = await payrollService.getPayslips(params);
      
      if (response.success) {
        dispatch(fetchPayslipsSuccess({
          data: response.data,
          pagination: response.pagination
        }));
        console.log('✅ [PAYROLL THUNK] Payslips fetched:', response.data.length);
        return response;
      } else {
        throw new Error(response.message || 'Failed to fetch payslips');
      }
    } catch (error) {
      console.error('❌ [PAYROLL THUNK] Payslips fetch failed:', error);
      const errorMessage = error.message || 'Failed to fetch payslips';
      dispatch(fetchPayslipsFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch single payslip
export const fetchPayslip = createAsyncThunk(
  'payroll/fetchPayslip',
  async (payslipId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(fetchPayslipStart());
      console.log('📄 [PAYROLL THUNK] Fetching payslip:', payslipId);
      
      const response = await payrollService.getPayslipById(payslipId);
      
      if (response.success) {
        dispatch(fetchPayslipSuccess(response.data));
        console.log('✅ [PAYROLL THUNK] Payslip fetched successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch payslip');
      }
    } catch (error) {
      console.error('❌ [PAYROLL THUNK] Payslip fetch failed:', error);
      const errorMessage = error.message || 'Failed to fetch payslip';
      dispatch(fetchPayslipFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Generate payslips (bulk)
export const generatePayslips = createAsyncThunk(
  'payroll/generatePayslips',
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(generatePayslipsStart());
      console.log('⚙️ [PAYROLL THUNK] Generating payslips:', params);
      
      const response = await payrollService.generatePayslips(params);
      
      if (response.success) {
        dispatch(generatePayslipsSuccess(response.data));
        console.log('✅ [PAYROLL THUNK] Payslips generated:', response.data.success?.length || 0);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to generate payslips');
      }
    } catch (error) {
      console.error('❌ [PAYROLL THUNK] Payslip generation failed:', error);
      const errorMessage = error.message || 'Failed to generate payslips';
      dispatch(generatePayslipsFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete payslip
export const deletePayslip = createAsyncThunk(
  'payroll/deletePayslip',
  async (payslipId, { dispatch, rejectWithValue }) => {
    try {
      console.log('🗑️ [PAYROLL THUNK] Deleting payslip:', payslipId);
      
      const response = await payrollService.deletePayslip(payslipId);
      
      if (response.success) {
        console.log('✅ [PAYROLL THUNK] Payslip deleted successfully');
        // Refresh payslips list after deletion
        dispatch(fetchPayslips());
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete payslip');
      }
    } catch (error) {
      console.error('❌ [PAYROLL THUNK] Payslip deletion failed:', error);
      const errorMessage = error.message || 'Failed to delete payslip';
      return rejectWithValue(errorMessage);
    }
  }
);
