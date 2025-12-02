import employeeService from '../../services/employeeService';
import {
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
} from '../slices/employeeSlice';

// Fetch all employees with pagination and filters
export const fetchEmployees = (params = {}) => async (dispatch) => {
  try {
    dispatch(fetchEmployeesStart());
    const data = await employeeService.getEmployees(params);
    dispatch(fetchEmployeesSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to fetch employees';
    dispatch(fetchEmployeesFailure(errorMessage));
    throw error;
  }
};

// Fetch single employee by ID
export const fetchEmployeeById = (id) => async (dispatch) => {
  try {
    dispatch(fetchEmployeeStart());
    const data = await employeeService.getEmployeeById(id);
    dispatch(fetchEmployeeSuccess(data.employee));
    return data.employee;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to fetch employee';
    dispatch(fetchEmployeeFailure(errorMessage));
    throw error;
  }
};

// Create new employee
export const createEmployee = (employeeData) => async (dispatch) => {
  try {
    dispatch(createEmployeeStart());
    const data = await employeeService.createEmployee(employeeData);
    dispatch(createEmployeeSuccess(data.employee));
    return data.employee;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to create employee';
    dispatch(createEmployeeFailure(errorMessage));
    throw error;
  }
};

// Update employee
export const updateEmployee = (id, employeeData) => async (dispatch) => {
  try {
    dispatch(updateEmployeeStart());
    const data = await employeeService.updateEmployee(id, employeeData);
    dispatch(updateEmployeeSuccess(data.employee));
    return data.employee;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to update employee';
    dispatch(updateEmployeeFailure(errorMessage));
    throw error;
  }
};

// Delete employee
export const deleteEmployee = (id) => async (dispatch) => {
  try {
    dispatch(deleteEmployeeStart());
    await employeeService.deleteEmployee(id);
    dispatch(deleteEmployeeSuccess(id));
    return id;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to delete employee';
    dispatch(deleteEmployeeFailure(errorMessage));
    throw error;
  }
};

// Search employees
export const searchEmployees = (searchParams) => async (dispatch) => {
  try {
    dispatch(searchEmployeesStart());
    const data = await employeeService.searchEmployees(searchParams);
    dispatch(searchEmployeesSuccess(data));
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Failed to search employees';
    dispatch(searchEmployeesFailure(errorMessage));
    throw error;
  }
};
