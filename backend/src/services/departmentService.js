import Department from '../models/Department.js';
import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';
import Employee from '../models/Employee.js';

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
      name: departmentData.name,
      isActive: true,
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
      const isUnique = await Department.isCodeUnique(departmentData.code);
      if (!isUnique) {
        throw {
          code: 'DUPLICATE_DEPARTMENT_CODE',
          message: 'A department with this code already exists.',
          statusCode: 409,
        };
      }
    }

    // Validate parent department exists if provided
    if (departmentData.parentDepartment) {
      const parentDept = await Department.findById(departmentData.parentDepartment);
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
    const department = new Department(departmentData);
    await department.save();

    // Log creation in audit log
    await AuditLog.logAction({
      action: 'CREATE',
      entityType: 'Department',
      entityId: department._id,
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
    const department = await Department.findById(departmentId);
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
        name: updateData.name,
        _id: { $ne: departmentId },
        isActive: true,
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
        if (updateData.parentDepartment.toString() === departmentId) {
          throw {
            code: 'INVALID_PARENT_DEPARTMENT',
            message: 'Department cannot be its own parent.',
            statusCode: 400,
          };
        }

        const parentDept = await Department.findById(updateData.parentDepartment);
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
        entityId: department._id,
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

    // Build query
    const query = {};

    // Filter by active status
    if (!includeInactive) {
      query.isActive = true;
    }

    // Filter by parent department
    if (parentDepartment !== undefined) {
      query.parentDepartment = parentDepartment === 'null' || parentDepartment === null ? null : parentDepartment;
    }

    // Search by name or code
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { code: regex }];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('parentDepartment', 'name code')
        .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean(),
      Department.countDocuments(query),
    ]);

    logger.info(`Retrieved ${departments.length} departments (total: ${total})`);

    return {
      departments,
      pagination: {
        page,
        limit,
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
    const department = await Department.findById(departmentId)
      .populate('parentDepartment', 'name code')
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId contactInfo.email');

    if (!department) {
      throw {
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'Department not found.',
        statusCode: 404,
      };
    }

    const result = department.toObject();

    // Include child departments if requested
    if (includeChildren) {
      result.children = await Department.find({ parentDepartment: departmentId, isActive: true })
        .select('name code manager location')
        .populate('manager', 'personalInfo.firstName personalInfo.lastName')
        .lean();
    }

    // Get full path
    result.fullPath = await department.getFullPath();

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
    const tree = await Department.getHierarchyTree(rootId);
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
    const department = await Department.findById(departmentId);
    if (!department) {
      throw {
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'Department not found.',
        statusCode: 404,
      };
    }

    // Check if department has children
    const hasChildren = await department.hasChildren();
    if (hasChildren) {
      throw {
        code: 'DEPARTMENT_HAS_CHILDREN',
        message: 'Cannot delete department with child departments. Please reassign or delete child departments first.',
        statusCode: 400,
      };
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({
      'jobInfo.department': departmentId,
      status: { $ne: 'Terminated' },
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
      entityId: department._id,
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
