import { User, AuditLog, Department, Employee } from '../models/sequelize/index.js';
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

    if (userData.role === 'HR Manager') {
      if (!userData.assignedDepartments || userData.assignedDepartments.length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'HR Manager must have at least one assigned department.',
          statusCode: 400,
        };
      }
    }

    const user = await User.create({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      assignedDepartments: userData.assignedDepartments || [],
      employeeId: userData.employeeId || null,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdBy: currentUser.id,
    });

    await AuditLog.logAction({
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id.toString(),
      userId: currentUser.id,
      userRole: currentUser.role,
      changes: [
        {
          field: 'user',
          oldValue: null,
          newValue: {
            email: user.email,
            role: user.role,
            assignedDepartments: user.assignedDepartments,
            isActive: user.isActive,
          },
        },
      ],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
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

    if (updateData.role === 'HR Manager' ||
        (user.role === 'HR Manager' && !updateData.role)) {
      const departments = updateData.assignedDepartments ?? user.assignedDepartments;

      if (!departments || departments.length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'HR Manager must have at least one assigned department.',
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

    if (updateData.employeeId !== undefined) {
      if (user.employeeId?.toString() !== updateData.employeeId?.toString()) {
        changes.push({
          field: 'employeeId',
          oldValue: user.employeeId,
          newValue: updateData.employeeId,
        });
        user.employeeId = updateData.employeeId;
      }
    }

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
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id.toString(),
        userId: currentUser.id,
        userRole: currentUser.role,
        changes,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
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

    const validRoles = ['SuperAdmin', 'HR Manager', 'HR Administrator', 'Employee'];
    if (!validRoles.includes(newRole)) {
      throw {
        code: 'INVALID_ROLE',
        message: `Invalid role. Must be: ${validRoles.join(', ')}`,
        statusCode: 400,
      };
    }

    if (user.role === newRole) {
      throw {
        code: 'NO_CHANGE',
        message: 'User already has this role.',
        statusCode: 400,
      };
    }

    const oldRole = user.role;

    if (newRole === 'HR Manager') {
      if (!user.assignedDepartments || user.assignedDepartments.length === 0) {
        throw {
          code: 'VALIDATION_ERROR',
          message: 'Cannot assign HR Manager role without departments.',
          statusCode: 400,
        };
      }
    }

    if (oldRole === 'HR Manager' && newRole !== 'HR Manager') {
      user.assignedDepartments = [];
    }

    user.role = newRole;
    user.refreshToken = undefined;

    await user.save();

    await AuditLog.logAction({
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id.toString(),
      userId: currentUser.id,
      userRole: currentUser.role,
      changes: [{ field: 'role', oldValue: oldRole, newValue: newRole }],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
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

    if (user.role === 'SuperAdmin') {
      const activeSuperAdmins = await User.count({
        where: {
          role: 'SuperAdmin',
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
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id.toString(),
      userId: currentUser.id,
      userRole: currentUser.role,
      changes: [{ field: 'isActive', oldValue: true, newValue: false }],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
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
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id.toString(),
      userId: currentUser.id,
      userRole: currentUser.role,
      changes: [{ field: 'isActive', oldValue: false, newValue: true }],
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
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
          attributes: ['personalInfo', 'employeeId'],
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

    return user;
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
          attributes: ['personalInfo', 'employeeId'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      users,
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
        role: 'SuperAdmin',
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
