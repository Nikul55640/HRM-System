import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: [],
  currentEmployee: null,
  searchResults: [],
  filters: {
    department: [],
    jobTitle: [],
    employmentType: [],
    workLocation: [],
    status: [],
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  loading: false,
  error: null,
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    // Fetch employees
    fetchEmployeesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeesSuccess: (state, action) => {
      state.loading = false;
      state.employees = action.payload.employees;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    fetchEmployeesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single employee
    fetchEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEmployeeSuccess: (state, action) => {
      state.loading = false;
      state.currentEmployee = action.payload;
      state.error = null;
    },
    fetchEmployeeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create employee
    createEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createEmployeeSuccess: (state, action) => {
      state.loading = false;
      state.employees.push(action.payload);
      state.error = null;
    },
    createEmployeeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update employee
    updateEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateEmployeeSuccess: (state, action) => {
      state.loading = false;
      const index = state.employees.findIndex(emp => emp._id === action.payload._id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
      if (state.currentEmployee?._id === action.payload._id) {
        state.currentEmployee = action.payload;
      }
      state.error = null;
    },
    updateEmployeeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete employee
    deleteEmployeeStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteEmployeeSuccess: (state, action) => {
      state.loading = false;
      state.employees = state.employees.filter(emp => emp._id !== action.payload);
      if (state.currentEmployee?._id === action.payload) {
        state.currentEmployee = null;
      }
      state.error = null;
    },
    deleteEmployeeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Search employees
    searchEmployeesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    searchEmployeesSuccess: (state, action) => {
      state.loading = false;
      state.searchResults = action.payload.employees;
      state.pagination = action.payload.pagination;
      state.error = null;
    },
    searchEmployeesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Clear current employee
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchEmployeesStart,
  fetchEmployeesSuccess,
  fetchEmployeesFailure,
  fetchEmployeeStart,
  fetchEmployeeSuccess,
  fetchEmployeeFailure,
  createEmployeeStart,
  createEmployeeSuccess,
  createEmployeeFailure,
  updateEmployeeStart,
  updateEmployeeSuccess,
  updateEmployeeFailure,
  deleteEmployeeStart,
  deleteEmployeeSuccess,
  deleteEmployeeFailure,
  searchEmployeesStart,
  searchEmployeesSuccess,
  searchEmployeesFailure,
  setFilters,
  clearFilters,
  setPagination,
  clearCurrentEmployee,
  clearSearchResults,
  clearError,
} = employeeSlice.actions;

export default employeeSlice.reducer;
