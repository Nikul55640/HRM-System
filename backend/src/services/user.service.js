import { User, AuditLog, Department, Employee } from '../models/sequelize/index.js';
import { ROLES, normalizeToSystemRole, systemRoleToDatabase, isValidSystemRole } from '../config/roles.js';
import logger from '../utils/logger.js';

/**
 * Create a new user
 */
const createUser = async (userData, currentUser, metadata = {}) => {
  try {
    const existingUser = await User.findOne({
      where: { email: userData.email.toLowerCase() }
    });

    if (existingUser) {
      throw {
        code: 'USER_EXISTS',
        message: 'A user with this email already exists.',
        statusCode: 409,
      };
    }

    // Normalize role to system constant
    const systemRole = normalizeToSystemRole(userData.role);
    if (!isValidSystemRole(systemRole)) {
      throw {
        code: 'INVALID_ROLE',
        message: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`,
        statusCode: 400,
      };
    }

    if (systemRole === ROLES.HR_MANAGER) {
      if (!userData.assignedDepartments || userData.assignedDepartments.length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'HR_Manager must have at least one assigned department.',
          statusCode: 400,
        };
      }
    }

    // Convert system role to database format for storage
    const dbRole = systemRoleToDatabase(systemRole);

    const user = await User.create({
      name: userData.name || userData.email.split('@')[0], // Use provided name or extract from email
      email: userData.email,
      password: userData.password,
      role: dbRole, // Store in database format
      assignedDepartments: userData.assignedDepartments || [],
      employeeId: userData.employeeId || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdBy: currentUser.id,
    });

    await AuditLog.logAction({
      userId: currentUser.id,
      action: 'employee_create',
      module: 'employee',
      targetType: 'User',
      targetId: user.id,
      description: `Created new user: ${user.email} with role ${systemRole}`,
      newValues: {
        email: user.email,
        role: systemRole, // Log system role for clarity
        assignedDepartments: user.assignedDepartments,
        isActive: user.isActive,
      },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      severity: 'medium'
    });

    logger.info(`User created: ${user.email} by SuperAdmin ${currentUser.email}`);
    return user;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update user
 */
const updateUser = async (userId, updateData, currentUser, metadata = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        statusCode: 404,
      };
    }

    if (updateData.email) {
      const newEmail = updateData.email.toLowerCase();

      if (newEmail !== user.email.toLowerCase()) {
        const existingUser = await User.findOne({
          where: {
            email: newEmail,
            id: { [User.sequelize.Sequelize.Op.ne]: userId },
          },
        });

        if (existingUser) {
          throw {
            code: 'DUPLICATE_EMAIL',
            message: 'A user with this email already exists.',
            statusCode: 409,
          };
        }
      }
    }

    const userSystemRole = user.systemRole || user.role;
    if (updateData.role === 'HR_Manager' ||
      (userSystemRole === ROLES.HR_MANAGER && !updateData.role)) {
      const departments = updateData.assignedDepartments ?? user.assignedDepartments;

      if (!departments || departments.length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'HR_Manager must have at least one assigned department.',
          statusCode: 400,
        };
      }
    }

    const changes = [];

    if (updateData.email && user.email !== updateData.email.toLowerCase()) {
      changes.push({
        field: 'email',
        oldValue: user.email,
        newValue: updateData.email.toLowerCase(),
      });
      user.email = updateData.email.toLowerCase();
    }

    if (updateData.password) {
      changes.push({
        field: 'password',
        oldValue: '***',
        newValue: '*** (changed)',
      });
      user.password = updateData.password;
    }

    if (updateData.role && user.role !== updateData.role) {
      changes.push({
        field: 'role',
        oldValue: user.role,
        newValue: updateData.role,
      });
      user.role = updateData.role;
    }

    if (updateData.assignedDepartments !== undefined) {
      if (JSON.stringify(user.assignedDepartments) !== JSON.stringify(updateData.assignedDepartments)) {
        changes.push({
          field: 'assignedDepartments',
          oldValue: user.assignedDepartments,
          newValue: updateData.assignedDepartments,
        });
        user.assignedDepartments = updateData.assignedDepartments;
      }
    }

    // Note: employeeId is not a direct property of User model
    // Employee records are linked via userId in the Employee model
    // If you need to update employee data, use the Employee service instead

    if (updateData.isActive !== undefined && user.isActive !== updateData.isActive) {
      changes.push({
        field: 'isActive',
        oldValue: user.isActive,
        newValue: updateData.isActive,
      });
      user.isActive = updateData.isActive;
    }

    await user.save();

    if (changes.length > 0) {
      await AuditLog.logAction({
        userId: currentUser.id,
        action: 'employee_update',
        module: 'employee',
        targetType: 'User',
        targetId: user.id,
        description: `Updated user: ${user.email}`,
        oldValues: Object.fromEntries(changes.map(c => [c.field, c.oldValue])),
        newValues: Object.fromEntries(changes.map(c => [c.field, c.newValue])),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        severity: 'medium'
      });
    }

    logger.info(`User updated: ${user.email} by SuperAdmin ${currentUser.email}`);
    return user;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Change user role
 */
const changeUserRole = async (userId, newRole, currentUser, metadata = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        statusCode: 404,
      };
    }

    // Normalize and validate new role
    const systemRole = normalizeToSystemRole(newRole);
    if (!isValidSystemRole(systemRole)) {
      throw {
        code: 'INVALID_ROLE',
        message: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`,
        statusCode: 400,
      };
    }

    // Convert to database format for comparison
    const dbRole = systemRoleToDatabase(systemRole);
    
    if (user.role === dbRole) {
      throw {
        code: 'NO_CHANGE',
        message: 'User already has this role.',
        statusCode: 400,
      };
    }

    const oldRole = user.role;
    const oldSystemRole = normalizeToSystemRole(oldRole);

    if (systemRole === ROLES.HR_MANAGER) {
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'Cannot assign HR Manager role without departments.',
          statusCode: 400,
        };
      }
    }

    // Clear assigned departments if changing from HR_Manager to other roles
    if (oldSystemRole === ROLES.HR_MANAGER && systemRole !== ROLES.HR_MANAGER) {
      user.assignedDepartments = [];
    }

    user.role = dbRole; // Store in database format
    user.refreshToken = undefined;

    await user.save();

    await AuditLog.logAction({
      userId: currentUser.id,
      action: 'role_change',
      module: 'employee',
      targetType: 'User',
      targetId: user.id,
      description: `Changed user role from ${oldSystemRole} to ${systemRole} for ${user.email}`,
      oldValues: { role: oldSystemRole },
      newValues: { role: systemRole },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      severity: 'high'
    });

    logger.info(`User role changed: ${user.email}`);
    return user;
  } catch (error) {
    logger.error('Error changing user role:', error);
    throw error;
  }
};

/**
 * Deactivate user
 */
const deactivateUser = async (userId, currentUser, metadata = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        statusCode: 404,
      };
    }

    if (!user.isActive) {
      throw {
        code: 'ALREADY_DEACTIVATED',
        message: 'User is already deactivated.',
        statusCode: 400,
      };
    }

    const userSystemRole = user.systemRole || user.role;
    if (userSystemRole === systemRoleToDatabase(ROLES.SUPER_ADMIN)) {
      const activeSuperAdmins = await User.count({
        where: {
          role: systemRoleToDatabase(ROLES.SUPER_ADMIN),
          isActive: true,
        },
      });

      if (activeSuperAdmins <= 1) {
        throw {
          code: 'LAST_SUPERADMIN',
          message: 'Cannot deactivate the last active SuperAdmin.',
          statusCode: 400,
        };
      }
    }

    user.isActive = false;
    user.refreshToken = undefined;

    await user.save();

    await AuditLog.logAction({
      userId: currentUser.id,
      action: 'employee_deactivate',
      module: 'employee',
      targetType: 'User',
      targetId: user.id,
      description: `Deactivated user: ${user.email}`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      severity: 'high'
    });

    return user;
  } catch (error) {
    logger.error('Error deactivating user:', error);
    throw error;
  }
};

/**
 * Activate user
 */
const activateUser = async (userId, currentUser, metadata = {}) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        statusCode: 404,
      };
    }

    if (user.isActive) {
      throw {
        code: 'ALREADY_ACTIVE',
        message: 'User is already active.',
        statusCode: 400,
      };
    }

    user.isActive = true;
    await user.save();

    await AuditLog.logAction({
      userId: currentUser.id,
      action: 'employee_activate',
      module: 'employee',
      targetType: 'User',
      targetId: user.id,
      description: `Activated user: ${user.email}`,
      oldValues: { isActive: false },
      newValues: { isActive: true },
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      severity: 'medium'
    });

    return user;
  } catch (error) {
    logger.error('Error activating user:', error);
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'employeeId'],
        },
      ],
    });

    if (!user) {
      throw {
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
        statusCode: 404,
      };
    }

    const userJson = user.toJSON();
    
    // Populate department details if user has assignedDepartments
    if (userJson.assignedDepartments && userJson.assignedDepartments.length > 0) {
      const departments = await Department.findAll({
        where: {
          id: userJson.assignedDepartments,
        },
        attributes: ['id', 'name', 'code'],
      });
      
      userJson.assignedDepartments = departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
      }));
    } else {
      userJson.assignedDepartments = [];
    }

    return userJson;
  } catch (error) {
    logger.error('Error getting user:', error);
    throw error;
  }
};

/**
 * List users with pagination
 */
const listUsers = async (filters = {}, pagination = {}) => {
  try {
    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc',
    } = pagination;

    const offset = (page - 1) * limit;

    const where = {};

    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      where.email = { [User.sequelize.Sequelize.Op.like]: `%${filters.search}%` };
    }

    const { count: total, rows: users } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'employeeId'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Populate department details for users with assignedDepartments
    const usersWithDepartments = await Promise.all(
      users.map(async (user) => {
        const userJson = user.toJSON();
        
        if (userJson.assignedDepartments && userJson.assignedDepartments.length > 0) {
          // Fetch department details for assigned department IDs
          const departments = await Department.findAll({
            where: {
              id: userJson.assignedDepartments,
            },
            attributes: ['id', 'name', 'code'],
          });
          
          userJson.assignedDepartments = departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            code: dept.code,
          }));
        } else {
          userJson.assignedDepartments = [];
        }
        
        return userJson;
      })
    );

    return {
      users: usersWithDepartments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing users:', error);
    throw error;
  }
};

/**
 * Check if email unique
 */
const isEmailUnique = async (email, excludeUserId = null) => {
  try {
    const where = { email: email.toLowerCase() };
    if (excludeUserId) {
      where.id = { [User.sequelize.Sequelize.Op.ne]: excludeUserId };
    }

    const exists = await User.findOne({ where });
    return !exists;
  } catch (error) {
    logger.error('Error checking email:', error);
    throw error;
  }
};

/**
 * Count active SuperAdmins
 */
const getActiveSuperAdminCount = async () => {
  try {
    return await User.count({
      where: {
        role: systemRoleToDatabase(ROLES.SUPER_ADMIN),
        isActive: true,
      },
    });
  } catch (error) {
    logger.error('Error counting superadmins:', error);
    throw error;
  }
};

/**
 *  ✅ FINAL EXPORT (Your preferred format)
 */
export default {
  createUser,
  updateUser,
  changeUserRole,
  deactivateUser,
  activateUser,
  getUserById,
  listUsers,
  isEmailUnique,
  getActiveSuperAdminCount,
};
