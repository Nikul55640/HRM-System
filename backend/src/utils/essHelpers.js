/**
 * Employee Self-Service Helper Functions
 * Utilities for ESS controllers
 */

/**
 * Check if user has an employee profile
 * Returns error response if not
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - true if has employeeId, false otherwise
 */
const requireEmployeeProfile = (req, res) => {
  if (!req.user.employeeId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'NO_EMPLOYEE_PROFILE',
        message: 'Employee Self-Service is only available for employees. This account is not linked to an employee profile.',
        timestamp: new Date().toISOString(),
      },
    });
    return false;
  }
  return true;
};

/**
 * Get employee ID from request
 * @param {Object} req - Express request object
 * @returns {string|null} - Employee ID or null
 */
const getEmployeeId = (req) => req.user?.employeeId || null;

/**
 * Check if user is an employee (has employeeId)
 * @param {Object} user - User object
 * @returns {boolean}
 */
const isEmployee = (user) => Boolean(user?.employeeId);

export {
  requireEmployeeProfile,
  getEmployeeId,
  isEmployee,
};
