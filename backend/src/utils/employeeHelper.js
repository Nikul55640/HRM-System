import { Employee } from '../models/sequelize/index.js';

/**
 * Get employee from authenticated request
 * @param {Object} req - Express request object with authenticated user
 * @returns {Promise<Employee>} Employee document
 * @throws {Error} If employee not found
 */
export const getEmployeeFromAuth = async (req) => {
  if (!req.user || !req.user.employeeId) {
    const error = new Error('No employee ID found in authentication');
    error.code = 'NO_EMPLOYEE_ID';
    throw error;
  }

  const employee = await Employee.findById(req.user.employeeId);

  if (!employee) {
    const error = new Error('Employee not found');
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }

  return employee;
};

/**
 * Conditional console log - only logs in development
 * @param {string} message - Log message
 * @param {any} data - Data to log
 */
exports.devLog = (message, data = null) => {
  if (process.env.NODE_ENV !== 'production') {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

/**
 * Conditional console error - only logs in development
 * @param {string} message - Error message
 * @param {any} error - Error object
 */
exports.devError = (message, error = null) => {
  if (process.env.NODE_ENV !== 'production') {
    if (error) {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};
