/**
 * Employee Management Controller
 * Comprehensive employee management with role assignment and designation system
 * Handles employee creation, updates, role assignments, and designation management
 */

import employeeService from '../../services/admin/employee.service.js';
import { Department, Designation, User } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';
import { ROLES } from '../../config/rolePermissions.js';

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

      // Prepare employee data
      const employeeData = {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: contactInfo.email.toLowerCase(),
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

      // Create employee
      const result = await employeeService.createEmployee(employeeData, req.user, metadata);

      if (!result.success) {
        return sendResponse(res, false, result.message, null, 400);
      }

      const employee = result.data;

      // Create user account with system role if specified
      let userAccount = null;
      if (systemRole && systemRole !== 'none') {
        try {
          const roleResult = await employeeService.assignRole(employee.id, systemRole, req.user, metadata);
          if (roleResult.success) {
            userAccount = roleResult.data;
            
            // If HR role, assign departments
            if (systemRole === ROLES.HR_ADMIN && assignedDepartments.length > 0) {
              await User.update(
                { assignedDepartments },
                { where: { id: userAccount.id } }
              );
            }
          }
        } catch (roleError) {
          logger.warn(`Failed to assign role to employee ${employee.id}:`, roleError);
        }
      }

      // Update designation employee count
      if (designationId) {
        await Designation.increment('employeeCount', { where: { id: designationId } });
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
          email: contactInfo.email?.toLowerCase(),
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
          const existingUser = await User.findOne({ where: { employeeId: id } });
          if (existingUser) {
            await existingUser.destroy();
          }
        } else {
          // Assign or update role
          const roleResult = await employeeService.assignRole(id, systemRole, req.user, metadata);
          if (roleResult.success) {
            userAccount = roleResult.data;
            
            // If HR role, assign departments
            if (systemRole === ROLES.HR_ADMIN && assignedDepartments.length > 0) {
              await User.update(
                { assignedDepartments },
                { where: { id: userAccount.id } }
              );
            }
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
      const { departmentId, includeInactive = false } = req.query;
      
      const where = {};
      if (!includeInactive) {
        where.isActive = true;
      }
      if (departmentId) {
        where.departmentId = departmentId;
      }

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

      return sendResponse(res, true, "Designations retrieved successfully", designations);

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
      if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.HR_ADMIN) {
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
      if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.HR_ADMIN) {
        return sendResponse(res, false, "Unauthorized: Only Super Admin and HR can update designations", null, 403);
      }

      const { id } = req.params;
      const updateData = { ...req.body, updatedBy: req.user.id };

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

      return sendResponse(res, true, "Designation updated successfully", designation);

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
      if (req.user.role !== ROLES.SUPER_ADMIN) {
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
        where: { employeeId: id },
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