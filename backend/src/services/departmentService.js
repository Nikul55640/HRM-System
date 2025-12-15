import { Department, AuditLog, Employee } from '../models/sequelize/index.js';
import logger from '../utils/logger.js';

/**
 * Department Service Layer
 * Handles all business logic for department management
 */

/**
 * Create a new department
 * @param {Object} departmentData - Department data
 * @param {Object} user - User creating the department
 * @param {Object} metadata - Request metadata (IP, user agent)
 * @returns {Promise<Object>} Created department
 */
const createDepartment = async (departmentData, user, metadata = {}) => {
  try {
    // Check if department name already exists
    const existingDepartment = await Department.findOne({
      where: {
        name: departmentData.name,
        isActive: true,
      },
    });

    if (existingDepartment) {
      throw {
        code: 'DUPLICATE_DEPARTMENT_NAME',
        message: 'A department with this name already exists.',
        statusCode: 409,
      };
    }

    // If code is provided, check uniqueness
    if (departmentData.code) {
      const existingCode = await Department.findOne({
        where: { code: departmentData.code },
      });
      if (existingCode) {
        throw {
          code: 'DUPLICATE_DEPARTMENT_CODE',
          message: 'A department with this code already exists.',
          statusCode: 409,
        };
      }
    }

    // Validate parent department exists if provided
    if (departmentData.parentDepartment) {
      const parentDept = await Department.findByPk(departmentData.parentDepartment);
      if (!parentDept) {
        throw {
          code: 'PARENT_DEPARTMENT_NOT_FOUND',
          message: 'Parent department does not exist.',
          statusCode: 404,
        };
      }
      if (!parentDept.isActive) {
        throw {
          code: 'PARENT_DEPARTMENT_INACTIVE',
          message: 'Parent department is not active.',
          statusCode: 400,
        };
      }
    }

    // Create department
    const department = await Department.create(departmentData);

    // Log creation in audit log
    await AuditLog.logAction({
      action: 'CREATE',
      entityType: 'Department',
      entityId: department.id.toString(),
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: 'department',
          oldValue: null,
          newValue: {
            name: department.name,
            code: department.code,
            parentDepartment: department.parentDepartment,
            manager: department.manager,
            location: department.location,
          },
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    logger.info(`Department created: ${department.name} (${department.code})`);
    return department;
  } catch (error) {
    logger.error('Error creating department:', error);
    throw error;
  }
};

/**
 * Update an existing department
 * @param {String} departmentId - Department ID
 * @param {Object} updateData - Updated department data
 * @param {Object} user - User updating the department
 * @param {Object} metadata - Request metadata
 * @returns {Promise<Object>} Updated department
 */
const updateDepartment = async (departmentId, updateData, user, metadata = {}) => {
  try {
    // Find existing department
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw {
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'Department not found.',
        statusCode: 404,
      };
    }

    // Track changes for audit log
    const changes = [];

    // Check if name is being changed and if new name already exists
    if (updateData.name && updateData.name !== department.name) {
      const existingDepartment = await Department.findOne({
        where: {
          name: updateData.name,
          id: { [Department.sequelize.Sequelize.Op.ne]: departmentId },
          isActive: true,
        },
      });

      if (existingDepartment) {
        throw {
          code: 'DUPLICATE_DEPARTMENT_NAME',
          message: 'A department with this name already exists.',
          statusCode: 409,
        };
      }

      changes.push({
        field: 'name',
        oldValue: department.name,
        newValue: updateData.name,
      });
    }

    // Check if code is being changed and if new code is unique
    if (updateData.code && updateData.code !== department.code) {
      const isUnique = await Department.isCodeUnique(updateData.code, departmentId);
      if (!isUnique) {
        throw {
          code: 'DUPLICATE_DEPARTMENT_CODE',
          message: 'A department with this code already exists.',
          statusCode: 409,
        };
      }

      changes.push({
        field: 'code',
        oldValue: department.code,
        newValue: updateData.code,
      });
    }

    // Validate parent department if being changed
    if (updateData.parentDepartment !== undefined) {
      if (updateData.parentDepartment) {
        // Prevent department from being its own parent
        if (updateData.parentDepartment.toString() === departmentId.toString()) {
          throw {
            code: 'INVALID_PARENT_DEPARTMENT',
            message: 'Department cannot be its own parent.',
            statusCode: 400,
          };
        }

        const parentDept = await Department.findByPk(updateData.parentDepartment);
        if (!parentDept) {
          throw {
            code: 'PARENT_DEPARTMENT_NOT_FOUND',
            message: 'Parent department does not exist.',
            statusCode: 404,
          };
        }
        if (!parentDept.isActive) {
          throw {
            code: 'PARENT_DEPARTMENT_INACTIVE',
            message: 'Parent department is not active.',
            statusCode: 400,
          };
        }
      }

      changes.push({
        field: 'parentDepartment',
        oldValue: department.parentDepartment,
        newValue: updateData.parentDepartment,
      });
    }

    // Track other field changes
    const fieldsToTrack = ['description', 'manager', 'location', 'isActive'];
    fieldsToTrack.forEach((field) => {
      if (updateData[field] !== undefined && updateData[field] !== department[field]) {
        changes.push({
          field,
          oldValue: department[field],
          newValue: updateData[field],
        });
      }
    });

    // Update department
    Object.assign(department, updateData);
    await department.save();

    // Log update in audit log if there are changes
    if (changes.length > 0) {
      await AuditLog.logAction({
        action: 'UPDATE',
        entityType: 'Department',
        entityId: department.id.toString(),
        userId: user.id,
        userRole: user.role,
        changes,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });
    }

    logger.info(`Department updated: ${department.name} (${department.code}), ${changes.length} changes`);
    return department;
  } catch (error) {
    logger.error('Error updating department:', error);
    throw error;
  }
};

/**
 * Get all departments with optional filtering
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options (pagination, sorting)
 * @returns {Promise<Object>} Departments and metadata
 */
const getDepartments = async (filters = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
      includeInactive = false,
      parentDepartment,
      search,
    } = options;

    // Build where clause
    const where = {};

    // Filter by active status
    if (!includeInactive) {
      where.isActive = true;
    }

    // Filter by parent department
    if (parentDepartment !== undefined) {
      where.parentDepartment = parentDepartment === 'null' || parentDepartment === null ? null : parentDepartment;
    }

    // Search by name or code
    if (search) {
      where[Department.sequelize.Sequelize.Op.or] = [
        { name: { [Department.sequelize.Sequelize.Op.like]: `%${search}%` } },
        { code: { [Department.sequelize.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Execute query
    const { count: total, rows: departments } = await Department.findAndCountAll({
      where,
      include: [
        {
          model: Department,
          as: 'parent',
          attributes: ['id', 'name', 'code'],
          required: false,
        },
        {
          model: Employee,
          as: 'managerEmployee',
          attributes: ['id', 'employeeId', 'personalInfo'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    logger.info(`Retrieved ${departments.length} departments (total: ${total})`);

    return {
      departments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting departments:', error);
    throw error;
  }
};

/**
 * Get department by ID
 * @param {String} departmentId - Department ID
 * @param {Boolean} includeChildren - Include child departments
 * @returns {Promise<Object>} Department
 */
const getDepartmentById = async (departmentId, includeChildren = false) => {
  try {
    const department = await Department.findByPk(departmentId, {
      include: [
        {
          model: Department,
          as: 'parent',
          attributes: ['id', 'name', 'code'],
          required: false,
        },
        {
          model: Employee,
          as: 'managerEmployee',
          attributes: ['id', 'employeeId', 'personalInfo', 'contactInfo'],
          required: false,
        },
      ],
    });

    if (!department) {
      throw {
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'Department not found.',
        statusCode: 404,
      };
    }

    const result = department.toJSON();

    // Include child departments if requested
    if (includeChildren) {
      result.children = await Department.findAll({
        where: { parentDepartment: departmentId, isActive: true },
        attributes: ['id', 'name', 'code', 'manager', 'location'],
        include: [
          {
            model: Employee,
            as: 'managerEmployee',
            attributes: ['id', 'personalInfo'],
            required: false,
          },
        ],
      });
    }

    logger.info(`Retrieved department: ${department.name}`);
    return result;
  } catch (error) {
    logger.error('Error getting department by ID:', error);
    throw error;
  }
};

/**
 * Get department hierarchy tree
 * @param {String} rootId - Root department ID (null for top-level)
 * @returns {Promise<Array>} Department hierarchy tree
 */
const getDepartmentHierarchy = async (rootId = null) => {
  try {
    // Get all departments and build hierarchy
    const departments = await Department.findAll({
      where: { isActive: true },
      include: [
        {
          model: Employee,
          as: 'managerEmployee',
          attributes: ['id', 'personalInfo'],
          required: false,
        },
      ],
      order: [['name', 'ASC']],
    });

    // Build tree structure
    const buildTree = (parentId) => {
      return departments
        .filter(dept => dept.parentDepartment === parentId)
        .map(dept => ({
          ...dept.toJSON(),
          children: buildTree(dept.id),
        }));
    };

    const tree = buildTree(rootId);
    logger.info('Retrieved department hierarchy tree');
    return tree;
  } catch (error) {
    logger.error('Error getting department hierarchy:', error);
    throw error;
  }
};

/**
 * Delete (deactivate) a department
 * @param {String} departmentId - Department ID
 * @param {Object} user - User deleting the department
 * @param {Object} metadata - Request metadata
 * @returns {Promise<Object>} Deleted department
 */
const deleteDepartment = async (departmentId, user, metadata = {}) => {
  try {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw {
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'Department not found.',
        statusCode: 404,
      };
    }

    // Check if department has children
    const childrenCount = await Department.count({
      where: { parentDepartment: departmentId, isActive: true },
    });

    if (childrenCount > 0) {
      throw {
        code: 'DEPARTMENT_HAS_CHILDREN',
        message: 'Cannot delete department with child departments. Please reassign or delete child departments first.',
        statusCode: 400,
      };
    }

    // Check if department has employees
    const employeeCount = await Employee.count({
      where: {
        'jobInfo.department': departmentId,
        status: { [Employee.sequelize.Sequelize.Op.ne]: 'Terminated' },
      },
    });

    if (employeeCount > 0) {
      throw {
        code: 'DEPARTMENT_HAS_EMPLOYEES',
        message: `Cannot delete department with ${employeeCount} active employees. Please reassign employees first.`,
        statusCode: 400,
      };
    }

    // Soft delete by marking as inactive
    department.isActive = false;
    await department.save();

    // Log deletion in audit log
    await AuditLog.logAction({
      action: 'DELETE',
      entityType: 'Department',
      entityId: department.id.toString(),
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: 'isActive',
          oldValue: true,
          newValue: false,
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    logger.info(`Department deleted (deactivated): ${department.name}`);
    return department;
  } catch (error) {
    logger.error('Error deleting department:', error);
    throw error;
  }
};

/**
 * Search departments by name or code
 * @param {String} searchTerm - Search term
 * @returns {Promise<Array>} Matching departments
 */
const searchDepartments = async (searchTerm) => {
  try {
    const departments = await Department.searchDepartments(searchTerm);
    logger.info(`Found ${departments.length} departments matching: ${searchTerm}`);
    return departments;
  } catch (error) {
    logger.error('Error searching departments:', error);
    throw error;
  }
};

export default {
  createDepartment,
  updateDepartment,
  getDepartments,
  getDepartmentById,
  getDepartmentHierarchy,
  deleteDepartment,
  searchDepartments,
};
