/**
 * Employee Management Controller
 * Comprehensive employee management with role assignment and designation system
 * Handles employee creation, updates, role assignments, and designation management
 */

import employeeService from '../../services/admin/employee.service.js';
import notificationService from '../../services/notificationService.js';
import { Department, Designation, User } from '../../models/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/roles.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200, pagination = null) => {
  const response = {
    success,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

const employeeManagementController = {
  /**
   * Create new employee with role assignment and designation
   */
  createEmployeeWithRole: async (req, res) => {
    try {
      const { 
        personalInfo, 
        contactInfo, 
        jobInfo, 
        systemRole, 
        assignedDepartments = [] 
      } = req.body;

      // Validate required fields
      if (!personalInfo?.firstName || !personalInfo?.lastName || !contactInfo?.email) {
        return sendResponse(res, false, "First name, last name, and email are required", null, 400);
      }

      if (!jobInfo?.department || !jobInfo?.jobTitle) {
        return sendResponse(res, false, "Department and job title are required", null, 400);
      }

      // Validate designation if provided
      let designationId = null;
      if (jobInfo.designation) {
        const designation = await Designation.findByPk(jobInfo.designation);
        if (!designation) {
          return sendResponse(res, false, "Invalid designation selected", null, 400);
        }
        designationId = designation.id;
      }

      // Validate department
      const department = await Department.findByPk(jobInfo.department);
      if (!department) {
        return sendResponse(res, false, "Invalid department selected", null, 400);
      }

      // Prepare employee data (email is now stored in User table)
      const employeeData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: contactInfo.phoneNumber || null,
        dateOfBirth: personalInfo.dateOfBirth || null,
        gender: personalInfo.gender || null,
        address: contactInfo.currentAddress || {},
        designation: jobInfo.jobTitle, // Keep for backward compatibility
        designationId: designationId,
        department: department.name, // Keep for backward compatibility
        departmentId: department.id,
        joiningDate: jobInfo.hireDate || new Date(),
        employmentType: jobInfo.employmentType || 'full_time',
        reportingManager: jobInfo.manager || null,
        emergencyContact: contactInfo.emergencyContacts?.[0] || {},
        status: 'Active'
      };

      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Create user account first if system role is specified
      let userAccount = null;
      if (systemRole && systemRole !== 'none') {
        try {
          // Create user account first
          const userData = {
            email: contactInfo.email.toLowerCase(),
            password: 'TempPassword123!', // Should be changed on first login
            role: systemRole,
            assignedDepartments: systemRole === ROLES.HR_ADMIN ? assignedDepartments : [],
            isActive: true
          };

          userAccount = await User.create(userData);
          
          // Add userId to employee data
          employeeData.userId = userAccount.id;
          
        } catch (roleError) {
          logger.warn(`Failed to create user account:`, roleError);
          return sendResponse(res, false, "Failed to create user account: " + roleError.message, null, 400);
        }
      } else {
        // If no system role, we still need to create a basic user account for the relationship
        try {
          const userData = {
            email: contactInfo.email.toLowerCase(),
            password: 'TempPassword123!', // Should be changed on first login
            role: 'Employee', // Default role
            isActive: false // Inactive until system access is granted
          };

          userAccount = await User.create(userData);
          employeeData.userId = userAccount.id;
          
        } catch (roleError) {
          logger.warn(`Failed to create basic user account:`, roleError);
          return sendResponse(res, false, "Failed to create user account: " + roleError.message, null, 400);
        }
      }

      // Create employee with userId
      const result = await employeeService.createEmployee(employeeData, req.user, metadata);

      if (!result.success) {
        // If employee creation fails, clean up the user account
        if (userAccount) {
          try {
            await userAccount.destroy();
          } catch (cleanupError) {
            logger.warn('Failed to cleanup user account after employee creation failure:', cleanupError);
          }
        }
        return sendResponse(res, false, result.message, null, 400);
      }

      const employee = result.data;

      // Automatically assign default leave balances for the new employee
      try {
        const { default: DefaultLeaveBalanceService } = await import('../../services/admin/defaultLeaveBalance.service.js');
        const leaveBalanceResult = await DefaultLeaveBalanceService.assignDefaultBalancesToEmployee(
          employee.id,
          new Date().getFullYear(),
          req.user.id
        );

        if (leaveBalanceResult.success) {
          logger.info(`Default leave balances assigned to new employee ${employee.id}: ${leaveBalanceResult.created.length} balances created`);
        } else {
          logger.warn(`Failed to assign default leave balances to new employee ${employee.id}:`, leaveBalanceResult.error);
        }
      } catch (leaveError) {
        logger.warn('Failed to assign default leave balances to new employee:', leaveError);
        // Don't fail the employee creation if leave balance assignment fails
      }

      // Update designation employee count
      if (designationId) {
        await Designation.increment('employeeCount', { where: { id: designationId } });
      }

      // 🔔 Send welcome notification to new employee (if they have system access)
      try {
        if (userAccount && userAccount.id) {
          await notificationService.sendToUser(userAccount.id, {
            title: 'Welcome to the Team!',
            message: `Welcome ${personalInfo.firstName}! Your employee account has been created successfully. You can now access the HRM system.`,
            type: 'success',
            category: 'system',
            metadata: {
              employeeId: employee.id,
              department: jobInfo.department,
              jobTitle: jobInfo.jobTitle,
              role: systemRole,
              createdBy: req.user.firstName + ' ' + req.user.lastName
            }
          });

          // Send notification to HR/Admin about new employee
          const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
          await notificationService.sendToRoles(adminRoles, {
            title: 'New Employee Added 👥',
            message: `${personalInfo.firstName} ${personalInfo.lastName} has been added as a new employee in ${jobInfo.department} department.`,
            type: 'info',
            category: 'system',
            metadata: {
              employeeId: employee.id,
              employeeName: `${personalInfo.firstName} ${personalInfo.lastName}`,
              department: jobInfo.department,
              jobTitle: jobInfo.jobTitle,
              role: systemRole,
              createdBy: req.user.firstName + ' ' + req.user.lastName
            }
          });
        }
      } catch (notificationError) {
        logger.error("Failed to send employee creation notifications:", notificationError);
        // Don't fail the main operation if notification fails
      }

      return sendResponse(res, true, "Employee created successfully with role assignment", {
        employee,
        userAccount,
        hasSystemAccess: !!userAccount
      }, 201);

    } catch (error) {
      logger.error("Controller: Create Employee with Role Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update employee with role and designation management
   */
  updateEmployeeWithRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        personalInfo, 
        contactInfo, 
        jobInfo, 
        systemRole, 
        assignedDepartments = [] 
      } = req.body;

      // Get current employee
      const currentEmployee = await employeeService.getEmployeeById(id, req.user);
      if (!currentEmployee.success) {
        return sendResponse(res, false, currentEmployee.message, null, 404);
      }

      const employee = currentEmployee.data;
      const oldDesignationId = employee.designationId;

      // Validate designation if provided
      let designationId = null;
      if (jobInfo?.designation) {
        const designation = await Designation.findByPk(jobInfo.designation);
        if (!designation) {
          return sendResponse(res, false, "Invalid designation selected", null, 400);
        }
        designationId = designation.id;
      }

      // Validate department if provided
      let departmentData = null;
      if (jobInfo?.department) {
        departmentData = await Department.findByPk(jobInfo.department);
        if (!departmentData) {
          return sendResponse(res, false, "Invalid department selected", null, 400);
        }
      }

      // Prepare update data
      const updateData = {};
      
      if (personalInfo) {
        Object.assign(updateData, {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          dateOfBirth: personalInfo.dateOfBirth,
          gender: personalInfo.gender,
        });
      }

      if (contactInfo) {
        Object.assign(updateData, {
          phone: contactInfo.phoneNumber,
          address: contactInfo.currentAddress,
          emergencyContact: contactInfo.emergencyContacts?.[0] || employee.emergencyContact,
        });
      }

      if (jobInfo) {
        Object.assign(updateData, {
          designation: jobInfo.jobTitle,
          designationId: designationId,
          department: departmentData?.name,
          departmentId: departmentData?.id,
          joiningDate: jobInfo.hireDate,
          employmentType: jobInfo.employmentType,
          reportingManager: jobInfo.manager,
        });
      }

      const metadata = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      // Update employee
      const result = await employeeService.updateEmployee(id, updateData, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      // Handle role assignment
      let userAccount = null;
      if (systemRole !== undefined) {
        if (systemRole === 'none' || systemRole === null) {
          // Remove user account
          const existingUser = await User.findOne({ where: { id: employee.userId } });
          if (existingUser) {
            await employee.update({ userId: null });
            await existingUser.destroy();
          }
        } else {
          // Find existing user or create new one
          let existingUser = employee.userId ? await User.findByPk(employee.userId) : null;
          
          if (existingUser) {
            // Update existing user
            const userUpdateData = {
              role: systemRole,
              assignedDepartments: systemRole === ROLES.HR_ADMIN ? assignedDepartments : []
            };
            
            // Update email if provided in contactInfo
            if (contactInfo?.email) {
              userUpdateData.email = contactInfo.email.toLowerCase();
            }
            
            await existingUser.update(userUpdateData);
            userAccount = existingUser;
          } else {
            // Create new user account
            const userData = {
              email: contactInfo?.email || employee.user?.email || `${employee.firstName}.${employee.lastName}@company.com`.toLowerCase(),
              password: 'TempPassword123!', // Should be changed on first login
              role: systemRole,
              assignedDepartments: systemRole === ROLES.HR_ADMIN ? assignedDepartments : [],
              isActive: true
            };

            userAccount = await User.create(userData);
            await employee.update({ userId: userAccount.id });
          }
        }
      }

      // Update designation employee counts
      if (oldDesignationId && oldDesignationId !== designationId) {
        await Designation.decrement('employeeCount', { where: { id: oldDesignationId } });
      }
      if (designationId && designationId !== oldDesignationId) {
        await Designation.increment('employeeCount', { where: { id: designationId } });
      }

      return sendResponse(res, true, "Employee updated successfully", {
        employee: result.data,
        userAccount,
        hasSystemAccess: !!userAccount
      });

    } catch (error) {
      logger.error("Controller: Update Employee with Role Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get all designations for dropdown
   */
  getDesignations: async (req, res) => {
    try {
      const { departmentId, includeInactive = true } = req.query; // Changed default to true
      
      const where = {};
      if (!includeInactive || includeInactive === 'false') {
        where.isActive = true;
      }
      if (departmentId) {
        where.departmentId = departmentId;
      }

      console.log('🔍 [DESIGNATIONS] Query where clause:', where);

      const designations = await Designation.findAll({
        where,
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }
        ],
        order: [['level', 'ASC'], ['title', 'ASC']]
      });

      console.log('🔍 [DESIGNATIONS] Found designations:', designations.length);

      // Format response to ensure frontend gets expected data structure
      const formatted = designations.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        level: d.level,
        isActive: Boolean(d.isActive),
        departmentId: d.departmentId,
        department: d.department,
        employeeCount: d.employeeCount || 0,
        minSalary: d.minSalary,
        maxSalary: d.maxSalary,
        responsibilities: d.responsibilities || [],
        requirements: d.requirements || [],
        skills: d.skills || [],
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      }));

      return sendResponse(res, true, "Designations retrieved successfully", formatted);

    } catch (error) {
      logger.error("Controller: Get Designations Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Create new designation
   */
  createDesignation: async (req, res) => {
    try {
      // Only Super Admin and HR can create designations
      const userSystemRole = req.user.systemRole || req.user.role;
      if (userSystemRole !== ROLES.SUPER_ADMIN && userSystemRole !== ROLES.HR_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin and HR can create designations", null, 403);
      }

      const { title, description, level, departmentId, requirements, responsibilities } = req.body;

      if (!title || !departmentId) {
        return sendResponse(res, false, "Title and department are required", null, 400);
      }

      // Validate department
      const department = await Department.findByPk(departmentId);
      if (!department) {
        return sendResponse(res, false, "Invalid department selected", null, 400);
      }

      // Check for duplicate designation in same department
      const existingDesignation = await Designation.findOne({
        where: { title, departmentId, isActive: true }
      });

      if (existingDesignation) {
        return sendResponse(res, false, "Designation with this title already exists in the department", null, 409);
      }

      const designation = await Designation.create({
        title,
        description,
        level: level || 'mid',
        departmentId,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        createdBy: req.user.id,
        updatedBy: req.user.id
      });

      return sendResponse(res, true, "Designation created successfully", designation, 201);

    } catch (error) {
      logger.error("Controller: Create Designation Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Update designation
   */
  updateDesignation: async (req, res) => {
    try {
      // Only Super Admin and HR can update designations
      const userSystemRole = req.user.systemRole || req.user.role;
      if (userSystemRole !== ROLES.SUPER_ADMIN && userSystemRole !== ROLES.HR_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin and HR can update designations", null, 403);
      }

      const { id } = req.params;
      
      // Extract and validate data from request body
      const { 
        title, 
        description, 
        level, 
        departmentId, 
        requirements, 
        responsibilities, 
        skills,
        minSalary,
        maxSalary,
        isActive 
      } = req.body;

      const updateData = {
        updatedBy: req.user.id
      };

      // Only include fields that are provided
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (level !== undefined) updateData.level = level;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
      if (requirements !== undefined) updateData.requirements = requirements;
      if (responsibilities !== undefined) updateData.responsibilities = responsibilities;
      if (skills !== undefined) updateData.skills = skills;
      if (minSalary !== undefined) updateData.minSalary = minSalary;
      if (maxSalary !== undefined) updateData.maxSalary = maxSalary;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const designation = await Designation.findByPk(id);
      if (!designation) {
        return sendResponse(res, false, "Designation not found", null, 404);
      }

      // If changing department, validate it
      if (updateData.departmentId) {
        const department = await Department.findByPk(updateData.departmentId);
        if (!department) {
          return sendResponse(res, false, "Invalid department selected", null, 400);
        }
      }

      // Check for duplicate title in same department
      if (updateData.title && updateData.title !== designation.title) {
        const existingDesignation = await Designation.findOne({
          where: { 
            title: updateData.title, 
            departmentId: updateData.departmentId || designation.departmentId,
            isActive: true,
            id: { [Op.ne]: id }
          }
        });

        if (existingDesignation) {
          return sendResponse(res, false, "Designation with this title already exists in the department", null, 409);
        }
      }

      await designation.update(updateData);

      // Reload with associations for proper response
      const updatedDesignation = await Designation.findByPk(id, {
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }
        ]
      });

      return sendResponse(res, true, "Designation updated successfully", updatedDesignation);

    } catch (error) {
      logger.error("Controller: Update Designation Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Delete designation (soft delete)
   */
  deleteDesignation: async (req, res) => {
    try {
      // Only Super Admin can delete designations
      const userSystemRole = req.user.systemRole || req.user.role;
      if (userSystemRole !== ROLES.SUPER_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin can delete designations", null, 403);
      }

      const { id } = req.params;

      const designation = await Designation.findByPk(id);
      if (!designation) {
        return sendResponse(res, false, "Designation not found", null, 404);
      }

      // Check if designation has employees
      if (designation.employeeCount > 0) {
        return sendResponse(res, false, "Cannot delete designation with active employees", null, 400);
      }

      await designation.update({ 
        isActive: false, 
        updatedBy: req.user.id 
      });

      return sendResponse(res, true, "Designation deleted successfully");

    } catch (error) {
      logger.error("Controller: Delete Designation Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee form data (departments, designations, managers)
   */
  getEmployeeFormData: async (req, res) => {
    try {
      const { departmentId } = req.query;

      // Get departments
      const departments = await Department.findAll({
        where: { isActive: true },
        attributes: ['id', 'name', 'code'],
        order: [['name', 'ASC']]
      });

      // Get designations (filtered by department if specified)
      const designationWhere = { isActive: true };
      if (departmentId) {
        designationWhere.departmentId = departmentId;
      }

      const designations = await Designation.findAll({
        where: designationWhere,
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }
        ],
        order: [['level', 'ASC'], ['title', 'ASC']]
      });

      // Get potential managers (active employees who can be managers)
      const managers = await employeeService.listEmployees(
        { status: 'Active' }, 
        req.user, 
        { limit: 100, sortBy: 'firstName', sortOrder: 'asc' }
      );

      const formData = {
        departments,
        designations,
        managers: managers.success ? managers.data.employees : [],
        systemRoles: [
          { value: 'none', label: 'No System Access' },
          { value: ROLES.EMPLOYEE, label: 'Employee' },
          { value: ROLES.HR_ADMIN, label: 'HR Admin' },
          { value: ROLES.SUPER_ADMIN, label: 'Super Admin' }
        ]
      };

      return sendResponse(res, true, "Form data retrieved successfully", formData);

    } catch (error) {
      logger.error("Controller: Get Employee Form Data Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  },

  /**
   * Get employee with system role information
   */
  getEmployeeWithRole: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await employeeService.getEmployeeById(id, req.user);
      if (!result.success) {
        return sendResponse(res, false, result.message, null, 404);
      }

      const employee = result.data;

      // Get user account information
      const userAccount = await User.findOne({
        where: { id: employee.userId },
        attributes: ['id', 'email', 'role', 'isActive', 'assignedDepartments', 'lastLogin']
      });

      // Get designation details
      let designation = null;
      if (employee.designationId) {
        designation = await Designation.findByPk(employee.designationId, {
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name']
            }
          ]
        });
      }

      return sendResponse(res, true, "Employee retrieved successfully", {
        employee,
        userAccount,
        designation,
        hasSystemAccess: !!userAccount
      });

    } catch (error) {
      logger.error("Controller: Get Employee with Role Error", error);
      return sendResponse(res, false, "Internal server error", null, 500);
    }
  }
};

export default employeeManagementController;