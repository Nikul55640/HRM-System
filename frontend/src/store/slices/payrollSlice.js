import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Dashboard data
  dashboard: {
    statistics: null,
    recentPayslips: [],
    currentPeriod: null,
    loading: false,
    error: null
  },
  
  // Payslips list
  payslips: {
    data: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null
  },
  
  // Current payslip
  currentPayslip: {
    data: null,
    loading: false,
    error: null
  },
  
  // Bulk generation
  bulkGeneration: {
    loading: false,
    error: null,
    results: null
  },
  
  // Filters
  filters: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employeeId: '',
    status: ''
  }
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    // Dashboard actions
    fetchDashboardStart: (state) => {
      state.dashboard.loading = true;
      state.dashboard.error = null;
    },
    fetchDashboardSuccess: (state, action) => {
      state.dashboard.loading = false;
      state.dashboard.statistics = action.payload.statistics;
      state.dashboard.recentPayslips = action.payload.recentPayslips;
      state.dashboard.currentPeriod = action.payload.currentPeriod;
      state.dashboard.error = null;
    },
    fetchDashboardFailure: (state, action) => {
      state.dashboard.loading = false;
      state.dashboard.error = action.payload;
    },
    
    // Payslips list actions
    fetchPayslipsStart: (state) => {
      state.payslips.loading = true;
      state.payslips.error = null;
    },
    fetchPayslipsSuccess: (state, action) => {
      state.payslips.loading = false;
      state.payslips.data = action.payload.data;
      state.payslips.pagination = action.payload.pagination;
      state.payslips.error = null;
    },
    fetchPayslipsFailure: (state, action) => {
      state.payslips.loading = false;
      state.payslips.error = action.payload;
    },
    
    // Current payslip actions
    fetchPayslipStart: (state) => {
      state.currentPayslip.loading = true;
      state.currentPayslip.error = null;
    },
    fetchPayslipSuccess: (state, action) => {
      state.currentPayslip.loading = false;
      state.currentPayslip.data = action.payload;
      state.currentPayslip.error = null;
    },
    fetchPayslipFailure: (state, action) => {
      state.currentPayslip.loading = false;
      state.currentPayslip.error = action.payload;
    },
    
    // Bulk generation actions
    generatePayslipsStart: (state) => {
      state.bulkGeneration.loading = true;
      state.bulkGeneration.error = null;
      state.bulkGeneration.results = null;
    },
    generatePayslipsSuccess: (state, action) => {
      state.bulkGeneration.loading = false;
      state.bulkGeneration.results = action.payload;
      state.bulkGeneration.error = null;
    },
    generatePayslipsFailure: (state, action) => {
      state.bulkGeneration.loading = false;
      state.bulkGeneration.error = action.payload;
    },
    
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Pagination actions
    setPage: (state, action) => {
      state.payslips.pagination.page = action.payload;
    },
    
    // Clear actions
    clearCurrentPayslip: (state) => {
      state.currentPayslip = initialState.currentPayslip;
    },
    clearBulkResults: (state) => {
      state.bulkGeneration.results = null;
    }
  }
});

export const {
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
  generatePayslipsFailure,
  setFilters,
  resetFilters,
  setPage,
  clearCurrentPayslip,
  clearBulkResults
} = payrollSlice.actions;

export default payrollSlice.reducer;
