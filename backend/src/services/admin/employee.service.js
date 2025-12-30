/**
 * Employee Service Layer
 * Handles all business logic for employee management according to HRM system requirements
 */

import { Employee, User, Department, AuditLog } from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";
import { ROLES } from "../../config/rolePermissions.js";

class EmployeeService {
  /**
   * Create a new employee (Super Admin & HR only)
   * @param {Object} employeeData - Employee data
   * @param {Object} user - User creating the employee
   * @param {Object} metadata - Request metadata (IP, user agent)
   * @returns {Promise<Object>} Created employee
   */
  async createEmployee(employeeData, user, metadata = {}) {
    try {
      // Role-based access control
      if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin and HR can create employees", statusCode: 403 };
      }

      // Validation
      if (!employeeData.firstName || !employeeData.lastName) {
        throw { message: "First name and last name are required", statusCode: 400 };
      }

      if (!employeeData.email) {
        throw { message: "Email is required", statusCode: 400 };
      }

      // Check email uniqueness
      const emailLower = employeeData.email.toLowerCase();
      const existingEmployee = await Employee.findOne({
        where: { email: emailLower }
      });

      if (existingEmployee) {
        throw { message: "Employee with this email already exists", statusCode: 409 };
      }

      // Generate employee ID
      const lastEmployee = await Employee.findOne({
        order: [["createdAt", "DESC"]],
      });

      let nextNumber = 1;
      if (lastEmployee?.employeeId) {
        const lastNumber = parseInt(lastEmployee.employeeId.split("-").pop(), 10);
        nextNumber = lastNumber + 1;
      }

      const employeeId = `EMP-${new Date().getFullYear()}-${String(nextNumber).padStart(4, "0")}`;

      // Create employee with new model structure
      const employee = await Employee.create({
        employeeId,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: emailLower,
        phone: employeeData.phone || null,
        dateOfBirth: employeeData.dateOfBirth || null,
        gender: employeeData.gender || null,
        address: employeeData.address || {},
        profilePicture: employeeData.profilePicture || null,
        designation: employeeData.designation || null,
        department: employeeData.department || null,
        joiningDate: employeeData.joiningDate || new Date(),
        employmentType: employeeData.employmentType || 'full_time',
        reportingManager: employeeData.reportingManager || null,
        bankDetails: employeeData.bankDetails || {},
        emergencyContact: employeeData.emergencyContact || {},
        status: employeeData.status || 'Active',
        createdBy: user.id,
        updatedBy: user.id,
      });

      // Log creation in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: "employee_create",
        module: "employee",
        targetType: "Employee",
        targetId: employee.id,
        newValues: employee.toJSON(),
        description: `Created new employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      return {
        success: true,
        data: employee.toFrontendJSON(),
        message: 'Employee created successfully'
      };
    } catch (error) {
      logger.error('Error creating employee:', error);
      return {
        success: false,
        message: error.message || 'Failed to create employee',
        error: error.message
      };
    }
  }

  /**
   * Update an existing employee (Super Admin & HR only)
   * @param {String} employeeId - Employee ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User updating the employee
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Updated employee
   */
  async updateEmployee(employeeId, updateData, user, metadata = {}) {
    try {
      // Role-based access control
      if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin and HR can update employees", statusCode: 403 };
      }

      const employee = await Employee.findByPk(employeeId);

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee not found.",
          statusCode: 404,
        };
      }

      // Check email uniqueness if email is being updated
      if (updateData.email) {
        const emailLower = updateData.email.toLowerCase();
        const currentEmail = employee.email?.toLowerCase();
        if (emailLower !== currentEmail) {
          const existingEmployee = await Employee.findOne({
            where: {
              email: emailLower,
              id: { [Op.ne]: employeeId }
            }
          });

          if (existingEmployee) {
            throw {
              code: "DUPLICATE_EMAIL",
              message: "An employee with this email already exists.",
              statusCode: 409,
            };
          }
        }
      }

      // Track changes for audit log
      const oldValues = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        designation: employee.designation,
        department: employee.department,
        status: employee.status
      };

      // Update employee
      await employee.update({
        ...updateData,
        email: updateData.email ? updateData.email.toLowerCase() : employee.email,
        updatedBy: user.id
      });

      // Log update in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: "employee_update",
        module: "employee",
        targetType: "Employee",
        targetId: employee.id,
        oldValues,
        newValues: updateData,
        description: `Updated employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      logger.info(`Employee updated: ${employee.employeeId} by user ${user.email}`);

      return {
        success: true,
        data: employee,
        message: 'Employee updated successfully'
      };
    } catch (error) {
      logger.error("Error updating employee:", error);
      return {
        success: false,
        message: error.message || 'Failed to update employee',
        error: error.message
      };
    }
  }

  /**
   * Get employee by ID with role-based filtering
   * @param {String} employeeId - Employee ID
   * @param {Object} user - User requesting the employee
   * @returns {Promise<Object>} Employee data
   */
  async getEmployeeById(employeeId, user) {
    try {
      const where = { id: employeeId };

      // Apply role-based filtering
      if (user.role === ROLES.HR_ADMIN) {
        // HR can only access employees in their assigned departments
        if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
          throw {
            code: "NO_DEPARTMENTS_ASSIGNED",
            message: "You do not have any departments assigned.",
            statusCode: 403,
          };
        }
        where.department = {
          [Op.in]: user.assignedDepartments,
        };
      } else if (user.role === ROLES.EMPLOYEE) {
        // Employees can only access their own profile
        if (!user.employeeId || user.employeeId.toString() !== employeeId) {
          throw {
            code: "FORBIDDEN",
            message: "You can only access your own profile.",
            statusCode: 403,
          };
        }
      }

      const employee = await Employee.findOne({
        where,
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName'],
            required: false
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role', 'isActive'],
            required: false
          }
        ]
      });

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee not found or you do not have access.",
          statusCode: 404,
        };
      }

      // Return public JSON for non-admin users to hide sensitive bank details
      const empData = user.role === ROLES.EMPLOYEE ? employee.toPublicJSON() : employee.toFrontendJSON();

      return {
        success: true,
        data: empData
      };
    } catch (error) {
      logger.error("Error getting employee by ID:", error);
      return {
        success: false,
        message: error.message || 'Failed to get employee',
        error: error.message
      };
    }
  }

  /**
   * List employees with pagination and role-based filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} user - User requesting the list
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Employees list with pagination info
   */
  async listEmployees(filters = {}, user, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = pagination;
      const offset = (page - 1) * limit;

      // Build where clause based on filters
      const where = {};

      // Apply role-based scope filtering
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
          throw {
            code: "NO_DEPARTMENTS_ASSIGNED",
            message: "You do not have any departments assigned.",
            statusCode: 403,
          };
        }
        where.department = {
          [Op.in]: user.assignedDepartments,
        };
      } else if (user.role === ROLES.EMPLOYEE) {
        // Employees can only see active employees in directory view
        where.status = "Active";
      }

      // Apply additional filters
      if (filters.department) {
        where.department = filters.department;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.employmentType) {
        where.employmentType = filters.employmentType;
      }

      if (filters.designation) {
        where.designation = {
          [Op.like]: `%${filters.designation}%`,
        };
      }

      if (filters.search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${filters.search}%` } },
          { lastName: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
          { employeeId: { [Op.like]: `%${filters.search}%` } },
          { phone: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Count and fetch employees
      const { count: total, rows: employees } = await Employee.findAndCountAll({
        where,
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName'],
            required: false
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role', 'isActive'],
            required: false
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Return appropriate data based on user role
      const employeesData = employees.map(emp =>
        user.role === ROLES.EMPLOYEE ? emp.toPublicJSON() : emp.toFrontendJSON()
      );

      return {
        success: true,
        data: {
          employees: employeesData,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          }
        }
      };
    } catch (error) {
      logger.error("Error listing employees:", error);
      return {
        success: false,
        message: error.message || 'Failed to list employees',
        error: error.message
      };
    }
  }

  /**
   * Activate/Deactivate employee (Super Admin only)
   * @param {String} employeeId - Employee ID
   * @param {Boolean} isActive - Active status
   * @param {Object} user - User performing the action
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Updated employee
   */
  async toggleEmployeeStatus(employeeId, isActive, user, metadata = {}) {
    try {
      // Only Super Admin can activate/deactivate employees
      if (user.role !== ROLES.SUPER_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin can change employee status", statusCode: 403 };
      }

      const employee = await Employee.findByPk(employeeId);

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee not found.",
          statusCode: 404,
        };
      }

      const oldStatus = employee.status;
      const newStatus = isActive ? 'Active' : 'Inactive';

      await employee.update({
        status: newStatus,
        updatedBy: user.id
      });

      // Also update associated user account if exists
      const userAccount = await User.findOne({ where: { employeeId: employee.id } });
      if (userAccount) {
        await userAccount.update({ isActive });
      }

      // Log status change in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: isActive ? "employee_activate" : "employee_deactivate",
        module: "employee",
        targetType: "Employee",
        targetId: employee.id,
        oldValues: { status: oldStatus },
        newValues: { status: newStatus },
        description: `${isActive ? 'Activated' : 'Deactivated'} employee: ${employee.firstName} ${employee.lastName}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'high'
      });

      logger.info(`Employee ${isActive ? 'activated' : 'deactivated'}: ${employee.employeeId} by user ${user.email}`);

      return {
        success: true,
        data: employee,
        message: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      logger.error("Error toggling employee status:", error);
      return {
        success: false,
        message: error.message || 'Failed to update employee status',
        error: error.message
      };
    }
  }

  /**
   * Assign system role to employee (Super Admin only)
   * @param {String} employeeId - Employee ID
   * @param {String} role - Role to assign (HR, Employee)
   * @param {Object} user - User performing the action
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Updated user account
   */
  async assignRole(employeeId, role, user, metadata = {}) {
    try {
      // Only Super Admin can assign roles
      if (user.role !== ROLES.SUPER_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin can assign roles", statusCode: 403 };
      }

      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        throw { message: "Employee not found", statusCode: 404 };
      }

      // Find or create user account
      let userAccount = await User.findOne({ where: { employeeId: employee.id } });

      if (!userAccount) {
        // Create user account if doesn't exist
        userAccount = await User.create({
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          password: 'TempPassword123!', // Should be changed on first login
          role,
          employeeId: employee.id,
          isActive: true
        });
      } else {
        const oldRole = userAccount.role;
        await userAccount.update({ role });

        // Log role change
        await AuditLog.logAction({
          userId: user.id,
          action: "role_change",
          module: "employee",
          targetType: "User",
          targetId: userAccount.id,
          oldValues: { role: oldRole },
          newValues: { role },
          description: `Changed role from ${oldRole} to ${role} for ${employee.firstName} ${employee.lastName}`,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          severity: 'high'
        });
      }

      return {
        success: true,
        data: userAccount,
        message: 'Role assigned successfully'
      };
    } catch (error) {
      logger.error("Error assigning role:", error);
      return {
        success: false,
        message: error.message || 'Failed to assign role',
        error: error.message
      };
    }
  }

  /**
   * Get current employee profile for logged-in user
   * @param {Object} user - User requesting their profile
   * @returns {Promise<Object>} Employee profile
   */
  async getCurrentEmployee(user) {
    try {
      if (!user.employeeId) {
        throw {
          code: "NO_EMPLOYEE_PROFILE",
          message: "No employee profile is linked to this user account.",
          statusCode: 404,
        };
      }

      const employee = await Employee.findByPk(user.employeeId, {
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee profile not found.",
          statusCode: 404,
        };
      }

      logger.info(`Current employee profile accessed by user ${user.email}`);

      return {
        success: true,
        data: employee
      };
    } catch (error) {
      logger.error("Error getting current employee:", error);
      return {
        success: false,
        message: error.message || 'Failed to get employee profile',
        error: error.message
      };
    }
  }

  /**
   * Self-update employee profile (limited fields for employees)
   * @param {Object} updateData - Data to update (only allowed fields)
   * @param {Object} user - User updating their own profile
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Updated employee
   */
  async selfUpdateEmployee(updateData, user, metadata = {}) {
    try {
      if (!user.employeeId) {
        throw {
          code: "NO_EMPLOYEE_PROFILE",
          message: "No employee profile is linked to this user account.",
          statusCode: 404,
        };
      }

      const employee = await Employee.findByPk(user.employeeId);

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee profile not found.",
          statusCode: 404,
        };
      }

      // Define allowed fields for self-update (employees can only update personal info)
      const allowedFields = {
        phone: true,
        address: true,
        profilePicture: true,
        emergencyContact: true,
        bankDetails: true // Employees can update their own bank details
      };

      // Filter update data to only allowed fields
      const filteredUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields[key]) {
          filteredUpdateData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredUpdateData).length === 0) {
        throw {
          code: "NO_VALID_FIELDS",
          message: "No valid fields provided for update.",
          statusCode: 400,
        };
      }

      // Track changes for audit log
      const oldValues = {};
      Object.keys(filteredUpdateData).forEach(key => {
        oldValues[key] = employee[key];
      });

      // Update employee
      await employee.update({
        ...filteredUpdateData,
        updatedBy: user.id
      });

      // Log self-update in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: "profile_update",
        module: "profile",
        targetType: "Employee",
        targetId: employee.id,
        oldValues,
        newValues: filteredUpdateData,
        description: `Self-updated profile: ${employee.firstName} ${employee.lastName}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'low'
      });

      logger.info(`Employee self-updated: ${employee.employeeId} by user ${user.email}`);

      return {
        success: true,
        data: employee,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      logger.error("Error in self-update employee:", error);
      return {
        success: false,
        message: error.message || 'Failed to update profile',
        error: error.message
      };
    }
  }

  /**
   * Get employee directory (public listing for all employees)
   * @param {Object} filters - Optional filter criteria
   * @param {Object} user - User requesting the directory
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Directory listing with pagination
   */
  async getEmployeeDirectory(filters = {}, user, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "firstName",
        sortOrder = "asc",
      } = pagination;
      const offset = (page - 1) * limit;

      // Build where clause for directory
      const where = {
        status: "Active", // Only show active employees in directory
      };

      // Apply role-based scope filtering
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
          throw {
            code: "NO_DEPARTMENTS_ASSIGNED",
            message: "You do not have any departments assigned.",
            statusCode: 403,
          };
        }
        where.department = {
          [Op.in]: user.assignedDepartments,
        };
      }

      // Apply optional filters
      if (filters.department) {
        where.department = filters.department;
      }

      if (filters.designation) {
        where.designation = {
          [Op.like]: `%${filters.designation}%`,
        };
      }

      if (filters.search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${filters.search}%` } },
          { lastName: { [Op.like]: `%${filters.search}%` } },
          { designation: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Count and fetch employees
      const { count: total, rows: employees } = await Employee.findAndCountAll({
        where,
        attributes: [
          "id",
          "employeeId",
          "firstName",
          "lastName",
          "email",
          "phone",
          "designation",
          "department",
          "profilePicture"
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      logger.info(`Directory accessed by user ${user.email}`);

      return {
        success: true,
        data: {
          employees,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          }
        }
      };
    } catch (error) {
      logger.error("Error getting employee directory:", error);
      return {
        success: false,
        message: error.message || 'Failed to get employee directory',
        error: error.message
      };
    }
  }

  /**
   * Search employees with fuzzy matching and role-based filtering
   * @param {String} searchTerm - Search term (name, email, phone, employee ID)
   * @param {Object} user - User performing the search
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchEmployees(searchTerm, user, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "firstName",
        sortOrder = "asc",
      } = pagination;
      const offset = (page - 1) * limit;

      // Build where clause with role-based filtering
      const where = {};

      // Apply role-based scope filtering
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
          throw {
            code: "NO_DEPARTMENTS_ASSIGNED",
            message: "You do not have any departments assigned.",
            statusCode: 403,
          };
        }
        where.department = {
          [Op.in]: user.assignedDepartments,
        };
      } else if (user.role === ROLES.EMPLOYEE) {
        // Employees can only search within active employees (directory access)
        where.status = "Active";
      }

      // Add search criteria
      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;

        where[Op.or] = [
          { firstName: { [Op.like]: searchPattern } },
          { lastName: { [Op.like]: searchPattern } },
          { email: { [Op.like]: searchPattern } },
          { employeeId: { [Op.like]: searchPattern } },
          { phone: { [Op.like]: searchPattern } }
        ];
      }

      // Count and fetch employees
      const { count: total, rows: employees } = await Employee.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      logger.info(`Search performed by user ${user.email} with term: ${searchTerm}`);

      return {
        success: true,
        data: {
          employees,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          },
          searchTerm
        }
      };
    } catch (error) {
      logger.error("Error searching employees:", error);
      return {
        success: false,
        message: error.message || 'Failed to search employees',
        error: error.message
      };
    }
  }
  /**
   * Get employee full profile with all details including relationships
   * @param {String} employeeId - Employee ID
   * @param {Object} user - User requesting the profile
   * @returns {Promise<Object>} Full employee profile
   */
  async getEmployeeFullProfile(employeeId, user) {
    try {
      const where = { id: employeeId };

      // Apply role-based filtering
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
          throw {
            code: "NO_DEPARTMENTS_ASSIGNED",
            message: "You do not have any departments assigned.",
            statusCode: 403,
          };
        }
        where.department = {
          [Op.in]: user.assignedDepartments,
        };
      } else if (user.role === ROLES.EMPLOYEE) {
        if (!user.employeeId || user.employeeId.toString() !== employeeId) {
          throw {
            code: "FORBIDDEN",
            message: "You can only access your own profile.",
            statusCode: 403,
          };
        }
      }

      const employee = await Employee.findOne({
        where,
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'designation', 'email'],
            required: false
          },
          {
            model: Employee,
            as: 'subordinates',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'designation'],
            required: false
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role', 'isActive', 'lastLogin'],
            required: false
          }
        ]
      });

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee not found or you do not have access.",
          statusCode: 404,
        };
      }

      // Return appropriate data based on user role
      const empData = user.role === ROLES.EMPLOYEE ? employee.toPublicJSON() : employee.toJSON();

      return {
        success: true,
        data: empData
      };
    } catch (error) {
      logger.error("Error getting employee full profile:", error);
      return {
        success: false,
        message: error.message || 'Failed to get employee profile',
        error: error.message
      };
    }
  }

  /**
   * Get employee reporting structure (manager and subordinates)
   * @param {String} employeeId - Employee ID
   * @param {Object} user - User requesting the structure
   * @returns {Promise<Object>} Reporting structure
   */
  async getReportingStructure(employeeId, user) {
    try {
      // Role-based access control
      if (user.role === ROLES.EMPLOYEE && user.employeeId.toString() !== employeeId) {
        throw {
          code: "FORBIDDEN",
          message: "You can only view your own reporting structure.",
          statusCode: 403,
        };
      }

      const employee = await Employee.findByPk(employeeId, {
        include: [
          {
            model: Employee,
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'designation', 'email', 'profilePicture'],
            include: [
              {
                model: Employee,
                as: 'manager',
                attributes: ['id', 'employeeId', 'firstName', 'lastName', 'designation'],
                required: false
              }
            ],
            required: false
          },
          {
            model: Employee,
            as: 'subordinates',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'designation', 'email', 'profilePicture'],
            where: { status: 'Active' },
            required: false
          }
        ]
      });

      if (!employee) {
        throw {
          code: "EMPLOYEE_NOT_FOUND",
          message: "Employee not found.",
          statusCode: 404,
        };
      }

      const structure = {
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          designation: employee.designation,
          department: employee.department
        },
        manager: employee.manager,
        subordinates: employee.subordinates || [],
        hierarchyLevel: 0
      };

      // Calculate hierarchy level
      let currentManager = employee.manager;
      let level = 0;
      while (currentManager && level < 10) { // Prevent infinite loops
        level++;
        currentManager = currentManager.manager;
      }
      structure.hierarchyLevel = level;

      return {
        success: true,
        data: structure
      };
    } catch (error) {
      logger.error("Error getting reporting structure:", error);
      return {
        success: false,
        message: error.message || 'Failed to get reporting structure',
        error: error.message
      };
    }
  }
}

export default new EmployeeService();