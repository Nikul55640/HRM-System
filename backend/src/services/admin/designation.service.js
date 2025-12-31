/**
 * Designation Service Layer
 * Handles all business logic for designation management
 */

import { Designation, Department, Employee, AuditLog } from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";
import { ROLES } from "../../config/rolePermissions.js";

class DesignationService {
  /**
   * Create a new designation
   * @param {Object} designationData - Designation data
   * @param {Object} user - User creating the designation
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Created designation
   */
  async createDesignation(designationData, user, metadata = {}) {
    try {
      // Role-based access control
      if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin and HR can create designations", statusCode: 403 };
      }

      // Validation
      if (!designationData.title || !designationData.departmentId) {
        throw { message: "Title and department are required", statusCode: 400 };
      }

      // Validate department exists
      const department = await Department.findByPk(designationData.departmentId);
      if (!department || !department.isActive) {
        throw { message: "Invalid or inactive department", statusCode: 400 };
      }

      // Check for duplicate designation in same department
      const existingDesignation = await Designation.findOne({
        where: { 
          title: designationData.title, 
          departmentId: designationData.departmentId,
          isActive: true 
        }
      });

      if (existingDesignation) {
        throw { message: "Designation with this title already exists in the department", statusCode: 409 };
      }

      // Create designation
      const designation = await Designation.create({
        title: designationData.title,
        description: designationData.description || null,
        level: designationData.level || 'mid',
        departmentId: designationData.departmentId,
        requirements: designationData.requirements || [],
        responsibilities: designationData.responsibilities || [],
        salaryRange: designationData.salaryRange || {},
        isActive: true,
        employeeCount: 0,
        createdBy: user.id,
        updatedBy: user.id,
      });

      // Log creation in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: "designation_create",
        module: "designation",
        targetType: "Designation",
        targetId: designation.id,
        newValues: designation.toJSON(),
        description: `Created new designation: ${designation.title} in ${department.name}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      return {
        success: true,
        data: designation,
        message: 'Designation created successfully'
      };
    } catch (error) {
      logger.error('Error creating designation:', error);
      return {
        success: false,
        message: error.message || 'Failed to create designation',
        error: error.message
      };
    }
  }

  /**
   * Update an existing designation
   * @param {String} designationId - Designation ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User updating the designation
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Updated designation
   */
  async updateDesignation(designationId, updateData, user, metadata = {}) {
    try {
      // Role-based access control
      if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.HR_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin and HR can update designations", statusCode: 403 };
      }

      const designation = await Designation.findByPk(designationId);

      if (!designation) {
        throw {
          code: "DESIGNATION_NOT_FOUND",
          message: "Designation not found.",
          statusCode: 404,
        };
      }

      // Validate department if being updated
      if (updateData.departmentId) {
        const department = await Department.findByPk(updateData.departmentId);
        if (!department || !department.isActive) {
          throw { message: "Invalid or inactive department", statusCode: 400 };
        }
      }

      // Check for duplicate title in same department
      if (updateData.title && updateData.title !== designation.title) {
        const existingDesignation = await Designation.findOne({
          where: { 
            title: updateData.title, 
            departmentId: updateData.departmentId || designation.departmentId,
            isActive: true,
            id: { [Op.ne]: designationId }
          }
        });

        if (existingDesignation) {
          throw { message: "Designation with this title already exists in the department", statusCode: 409 };
        }
      }

      // Track changes for audit log
      const oldValues = {
        title: designation.title,
        description: designation.description,
        level: designation.level,
        departmentId: designation.departmentId
      };

      // Update designation
      await designation.update({
        ...updateData,
        updatedBy: user.id
      });

      // Log update in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: "designation_update",
        module: "designation",
        targetType: "Designation",
        targetId: designation.id,
        oldValues,
        newValues: updateData,
        description: `Updated designation: ${designation.title}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });

      logger.info(`Designation updated: ${designation.id} by user ${user.email}`);

      return {
        success: true,
        data: designation,
        message: 'Designation updated successfully'
      };
    } catch (error) {
      logger.error("Error updating designation:", error);
      return {
        success: false,
        message: error.message || 'Failed to update designation',
        error: error.message
      };
    }
  }

  /**
   * Get designation by ID
   * @param {String} designationId - Designation ID
   * @param {Object} user - User requesting the designation
   * @returns {Promise<Object>} Designation data
   */
  async getDesignationById(designationId, user) {
    try {
      const designation = await Designation.findByPk(designationId, {
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }
        ]
      });

      if (!designation) {
        throw {
          code: "DESIGNATION_NOT_FOUND",
          message: "Designation not found.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: designation
      };
    } catch (error) {
      logger.error("Error getting designation by ID:", error);
      return {
        success: false,
        message: error.message || 'Failed to get designation',
        error: error.message
      };
    }
  }

  /**
   * List designations with pagination and filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} user - User requesting the list
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Designations list with pagination info
   */
  async listDesignations(filters = {}, user, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "title",
        sortOrder = "asc",
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
        where.departmentId = {
          [Op.in]: user.assignedDepartments,
        };
      }

      // Apply additional filters
      if (filters.departmentId) {
        where.departmentId = filters.departmentId;
      }

      if (filters.level) {
        where.level = filters.level;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      } else {
        where.isActive = true; // Default to active only
      }

      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      // Count and fetch designations
      const { count: total, rows: designations } = await Designation.findAndCountAll({
        where,
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return {
        success: true,
        data: {
          designations,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
          }
        }
      };
    } catch (error) {
      logger.error("Error listing designations:", error);
      return {
        success: false,
        message: error.message || 'Failed to list designations',
        error: error.message
      };
    }
  }

  /**
   * Delete designation (soft delete)
   * @param {String} designationId - Designation ID
   * @param {Object} user - User performing the action
   * @param {Object} metadata - Request metadata
   * @returns {Promise<Object>} Deleted designation
   */
  async deleteDesignation(designationId, user, metadata = {}) {
    try {
      // Only Super Admin can delete designations
      if (user.role !== ROLES.SUPER_ADMIN) {
        throw { message: "Unauthorized: Only Super Admin can delete designations", statusCode: 403 };
      }

      const designation = await Designation.findByPk(designationId);

      if (!designation) {
        throw {
          code: "DESIGNATION_NOT_FOUND",
          message: "Designation not found.",
          statusCode: 404,
        };
      }

      // Check if designation has employees
      if (designation.employeeCount > 0) {
        throw {
          code: "DESIGNATION_HAS_EMPLOYEES",
          message: "Cannot delete designation with active employees.",
          statusCode: 400,
        };
      }

      const oldStatus = designation.isActive;

      await designation.update({
        isActive: false,
        updatedBy: user.id
      });

      // Log deletion in audit log
      await AuditLog.logAction({
        userId: user.id,
        action: "designation_delete",
        module: "designation",
        targetType: "Designation",
        targetId: designation.id,
        oldValues: { isActive: oldStatus },
        newValues: { isActive: false },
        description: `Deleted designation: ${designation.title}`,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'high'
      });

      logger.info(`Designation deleted: ${designation.id} by user ${user.email}`);

      return {
        success: true,
        data: designation,
        message: 'Designation deleted successfully'
      };
    } catch (error) {
      logger.error("Error deleting designation:", error);
      return {
        success: false,
        message: error.message || 'Failed to delete designation',
        error: error.message
      };
    }
  }

  /**
   * Get designations by department
   * @param {String} departmentId - Department ID
   * @param {Object} user - User requesting the designations
   * @returns {Promise<Object>} Designations for the department
   */
  async getDesignationsByDepartment(departmentId, user) {
    try {
      // Validate department
      const department = await Department.findByPk(departmentId);
      if (!department) {
        throw { message: "Department not found", statusCode: 404 };
      }

      // Role-based access control
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || !user.assignedDepartments.includes(parseInt(departmentId))) {
          throw { message: "You do not have access to this department", statusCode: 403 };
        }
      }

      const designations = await Designation.findAll({
        where: { 
          departmentId,
          isActive: true 
        },
        order: [['level', 'ASC'], ['title', 'ASC']]
      });

      return {
        success: true,
        data: designations
      };
    } catch (error) {
      logger.error("Error getting designations by department:", error);
      return {
        success: false,
        message: error.message || 'Failed to get designations',
        error: error.message
      };
    }
  }

  /**
   * Get designation hierarchy for a department
   * @param {String} departmentId - Department ID
   * @param {Object} user - User requesting the hierarchy
   * @returns {Promise<Object>} Designation hierarchy
   */
  async getDesignationHierarchy(departmentId, user) {
    try {
      // Validate department
      const department = await Department.findByPk(departmentId);
      if (!department) {
        throw { message: "Department not found", statusCode: 404 };
      }

      // Role-based access control
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || !user.assignedDepartments.includes(parseInt(departmentId))) {
          throw { message: "You do not have access to this department", statusCode: 403 };
        }
      }

      const designations = await Designation.findAll({
        where: { 
          departmentId,
          isActive: true 
        },
        order: [['level', 'ASC'], ['title', 'ASC']]
      });

      // Group by level
      const hierarchy = designations.reduce((acc, designation) => {
        const level = designation.level;
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(designation);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          department,
          hierarchy,
          levels: Object.keys(hierarchy).sort()
        }
      };
    } catch (error) {
      logger.error("Error getting designation hierarchy:", error);
      return {
        success: false,
        message: error.message || 'Failed to get designation hierarchy',
        error: error.message
      };
    }
  }

  /**
   * Search designations
   * @param {String} searchTerm - Search term
   * @param {Object} user - User performing the search
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results
   */
  async searchDesignations(searchTerm, user, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "title",
        sortOrder = "asc",
      } = pagination;
      const offset = (page - 1) * limit;

      // Build where clause with role-based filtering
      const where = { isActive: true };

      // Apply role-based scope filtering
      if (user.role === ROLES.HR_ADMIN) {
        if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
          throw {
            code: "NO_DEPARTMENTS_ASSIGNED",
            message: "You do not have any departments assigned.",
            statusCode: 403,
          };
        }
        where.departmentId = {
          [Op.in]: user.assignedDepartments,
        };
      }

      // Add search criteria
      if (searchTerm && searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`;

        where[Op.or] = [
          { title: { [Op.like]: searchPattern } },
          { description: { [Op.like]: searchPattern } }
        ];
      }

      // Count and fetch designations
      const { count: total, rows: designations } = await Designation.findAndCountAll({
        where,
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      logger.info(`Designation search performed by user ${user.email} with term: ${searchTerm}`);

      return {
        success: true,
        data: {
          designations,
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
      logger.error("Error searching designations:", error);
      return {
        success: false,
        message: error.message || 'Failed to search designations',
        error: error.message
      };
    }
  }
}

export default new DesignationService();