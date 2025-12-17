import {
  Department,
  AuditLog,
  Employee,
} from "../../models/sequelize/index.js";
import { Op } from "sequelize";
import logger from "../../utils/logger.js";

/**
 * Create a new department
 */
const createDepartment = async (departmentData, user, metadata = {}) => {
  try {
    const existingDepartment = await Department.findOne({
      where: { name: departmentData.name, isActive: true },
    });

    if (existingDepartment) {
      throw {
        code: "DUPLICATE_DEPARTMENT_NAME",
        message: "A department with this name already exists.",
        statusCode: 409,
      };
    }

    if (departmentData.code) {
      const existingCode = await Department.findOne({
        where: { code: departmentData.code },
      });
      if (existingCode) {
        throw {
          code: "DUPLICATE_DEPARTMENT_CODE",
          message: "A department with this code already exists.",
          statusCode: 409,
        };
      }
    }

    if (departmentData.parentDepartment) {
      const parentDept = await Department.findByPk(
        departmentData.parentDepartment
      );
      if (!parentDept || !parentDept.isActive) {
        throw {
          code: "INVALID_PARENT_DEPARTMENT",
          message: "Parent department does not exist or is inactive.",
          statusCode: 400,
        };
      }
    }

    const department = await Department.create(departmentData);

    await AuditLog.logAction({
      action: "CREATE",
      entityType: "Department",
      entityId: department.id,
      userId: user.id,
      userRole: user.role,
      changes: [
        {
          field: "department",
          oldValue: null,
          newValue: {
            name: department.name,
            code: department.code,
          },
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });

    return department;
  } catch (error) {
    logger.error("Error creating department:", error);
    throw error;
  }
};

/**
 * Update department
 */
const updateDepartment = async (
  departmentId,
  updateData,
  user,
  metadata = {}
) => {
  try {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      throw {
        code: "DEPARTMENT_NOT_FOUND",
        message: "Department not found.",
        statusCode: 404,
      };
    }

    const changes = [];

    if (updateData.name && updateData.name !== department.name) {
      const exists = await Department.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: departmentId },
          isActive: true,
        },
      });
      if (exists) {
        throw {
          code: "DUPLICATE_DEPARTMENT_NAME",
          message: "A department with this name already exists.",
          statusCode: 409,
        };
      }
      changes.push({
        field: "name",
        oldValue: department.name,
        newValue: updateData.name,
      });
    }

    if (updateData.code && updateData.code !== department.code) {
      const exists = await Department.findOne({
        where: { code: updateData.code, id: { [Op.ne]: departmentId } },
      });
      if (exists) {
        throw {
          code: "DUPLICATE_DEPARTMENT_CODE",
          message: "A department with this code already exists.",
          statusCode: 409,
        };
      }
      changes.push({
        field: "code",
        oldValue: department.code,
        newValue: updateData.code,
      });
    }

    if (updateData.parentDepartment !== undefined) {
      if (updateData.parentDepartment === departmentId) {
        throw {
          code: "INVALID_PARENT_DEPARTMENT",
          message: "Department cannot be its own parent.",
          statusCode: 400,
        };
      }
      changes.push({
        field: "parentDepartment",
        oldValue: department.parentDepartment,
        newValue: updateData.parentDepartment,
      });
    }

    Object.assign(department, updateData);
    await department.save();

    if (changes.length) {
      await AuditLog.logAction({
        action: "UPDATE",
        entityType: "Department",
        entityId: department.id,
        userId: user.id,
        userRole: user.role,
        changes,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      });
    }

    return department;
  } catch (error) {
    logger.error("Error updating department:", error);
    throw error;
  }
};

/**
 * Get departments
 */
const getDepartments = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 50, search, includeInactive = false } = options;

    const where = {};
    if (!includeInactive) where.isActive = true;

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Department.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset: (page - 1) * limit,
    });

    return {
      departments: rows,
      pagination: { page, limit, total: count },
    };
  } catch (error) {
    logger.error("Error fetching departments:", error);
    throw error;
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (departmentId, includeChildren = false) => {
  const department = await Department.findByPk(departmentId);
  if (!department) {
    throw {
      code: "DEPARTMENT_NOT_FOUND",
      message: "Department not found.",
      statusCode: 404,
    };
  }

  const result = department.toJSON();

  if (includeChildren) {
    result.children = await Department.findAll({
      where: { parentDepartment: departmentId, isActive: true },
    });
  }

  return result;
};

/**
 * Delete (soft) department
 */
const deleteDepartment = async (departmentId, user, metadata = {}) => {
  const department = await Department.findByPk(departmentId);
  if (!department) {
    throw {
      code: "DEPARTMENT_NOT_FOUND",
      message: "Department not found.",
      statusCode: 404,
    };
  }

  const employeeCount = await Employee.count({
    where: { departmentId, status: { [Op.ne]: "Terminated" } },
  });

  if (employeeCount > 0) {
    throw {
      code: "DEPARTMENT_HAS_EMPLOYEES",
      message: "Department has active employees.",
      statusCode: 400,
    };
  }

  department.isActive = false;
  await department.save();

  await AuditLog.logAction({
    action: "DELETE",
    entityType: "Department",
    entityId: department.id,
    userId: user.id,
    userRole: user.role,
    changes: [{ field: "isActive", oldValue: true, newValue: false }],
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
  });

  return department;
};

/**
 * Search departments
 */
const searchDepartments = async (searchTerm) => {
  return Department.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { code: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    limit: 20,
  });
};

export default {
  createDepartment,
  updateDepartment,
  getDepartments,
  getDepartmentById,
  deleteDepartment,
  searchDepartments,
};
