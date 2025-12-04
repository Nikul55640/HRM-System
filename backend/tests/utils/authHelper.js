/**
 * Authentication Helper for Tests
 * Provides utilities for creating test users and generating tokens
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js';
import Employee from '../../src/models/Employee.js';
import Department from '../../src/models/Department.js';

/**
 * Generate a JWT token for testing
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @param {string} expiresIn - Token expiration
 * @returns {string} JWT token
 */
export const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = '15m') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Create a test user with specified role
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: `test${Date.now()}@example.com`,
    password: 'Test@123456',
    role: 'Employee',
    isActive: true,
  };

  const user = await User.create({ ...defaultData, ...userData });
  return user;
};

/**
 * Create a test employee with user account
 * @param {Object} employeeData - Employee data
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created employee and user
 */
export const createTestEmployee = async (employeeData = {}, userData = {}) => {
  // Create department if not provided
  let departmentId = employeeData.department;
  if (!departmentId) {
    const department = await Department.create({
      name: `Test Department ${Date.now()}`,
      description: 'Test department for testing',
    });
    departmentId = department._id;
  }

  // Create user first
  const user = await createTestUser(userData);

  // Create employee
  const defaultEmployeeData = {
    personalInfo: {
      firstName: 'Test',
      lastName: 'User',
    },
    contactInfo: {
      email: user.email,
      phoneNumber: '1234567890',
    },
    jobInfo: {
      jobTitle: 'Test Position',
      department: departmentId,
      hireDate: new Date(),
      employmentType: 'Full-time',
    },
    userId: user._id,
    status: 'Active',
  };

  const employee = await Employee.create({ ...defaultEmployeeData, ...employeeData });

  // Update user with employee reference
  user.employeeId = employee._id;
  await user.save();

  return { user, employee };
};

/**
 * Generate authentication headers for API requests
 * @param {Object} user - User object
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeaders = (user) => {
  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
  });

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Create test users for all roles
 * @returns {Promise<Object>} Object with users for each role
 */
export const createTestUsersForAllRoles = async () => {
  const department = await Department.create({
    name: `Test Department ${Date.now()}`,
    description: 'Test department',
  });

  const superAdmin = await createTestEmployee(
    { jobInfo: { department: department._id } },
    { role: 'SuperAdmin', email: `superadmin${Date.now()}@test.com` }
  );

  const hrManager = await createTestEmployee(
    { jobInfo: { department: department._id } },
    { role: 'HR Manager', email: `hrmanager${Date.now()}@test.com` }
  );

  const hrAdmin = await createTestEmployee(
    { jobInfo: { department: department._id } },
    { role: 'HR Administrator', email: `hradmin${Date.now()}@test.com` }
  );

  const employee = await createTestEmployee(
    { jobInfo: { department: department._id } },
    { role: 'Employee', email: `employee${Date.now()}@test.com` }
  );

  return {
    superAdmin,
    hrManager,
    hrAdmin,
    employee,
    department,
  };
};

/**
 * Hash a password for testing
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
