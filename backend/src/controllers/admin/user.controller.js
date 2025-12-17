import userService from "../../services/user.service.js";
import logger from "../../utils/logger.js";

/**
 * User Controller
 * Handles HTTP requests for user management (SuperAdmin only)
 */

/**
 * Create a new user
 * POST /api/users
 * Access: SuperAdmin only
 */
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const currentUser = req.user;

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Create user using service layer
    const user = await userService.createUser(userData, currentUser, metadata);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user,
      },
      message: "User created successfully.",
    });
  } catch (error) {
    logger.error("Create user error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "CREATE_USER_ERROR",
        message: "An error occurred while creating user.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get all users with pagination and filtering
 * GET /api/users
 * Access: SuperAdmin only
 */
const getUsers = async (req, res) => {
  try {
    // Extract filters from query parameters
    const filters = {
      role: req.query.role,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
      department: req.query.department,
      search: req.query.search,
    };

    // Extract pagination parameters
    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    // Get users from service layer
    const result = await userService.listUsers(filters, pagination);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        users: result.users,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    logger.error("Get users error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "GET_USERS_ERROR",
        message: "An error occurred while fetching users.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Get user by ID
 * GET /api/users/:id
 * Access: SuperAdmin only
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user from service layer
    const user = await userService.getUserById(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    logger.error("Get user by ID error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "GET_USER_ERROR",
        message: "An error occurred while fetching user.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 * Access: SuperAdmin only
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const currentUser = req.user;

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Update user using service layer
    const user = await userService.updateUser(
      userId,
      updateData,
      currentUser,
      metadata
    );

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
      message: "User updated successfully.",
    });
  } catch (error) {
    logger.error("Update user error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          details: Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_USER_ERROR",
        message: "An error occurred while updating user.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Change user role
 * PATCH /api/users/:id/role
 * Access: SuperAdmin only
 */
const changeUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const currentUser = req.user;

    // Validate role is provided
    if (!role) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ROLE",
          message: "Role is required.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Change user role using service layer
    const user = await userService.changeUserRole(
      userId,
      role,
      currentUser,
      metadata
    );

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
      message: "User role changed successfully. User will need to login again.",
    });
  } catch (error) {
    logger.error("Change user role error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "CHANGE_ROLE_ERROR",
        message: "An error occurred while changing user role.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Deactivate user
 * DELETE /api/users/:id
 * Access: SuperAdmin only
 */
const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Prevent SuperAdmin from deactivating themselves
    if (userId === currentUser.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: "CANNOT_DEACTIVATE_SELF",
          message: "You cannot deactivate your own account.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Deactivate user using service layer
    const user = await userService.deactivateUser(
      userId,
      currentUser,
      metadata
    );

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
      message: "User deactivated successfully.",
    });
  } catch (error) {
    logger.error("Deactivate user error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "DEACTIVATE_USER_ERROR",
        message: "An error occurred while deactivating user.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Activate user
 * PATCH /api/users/:id/activate
 * Access: SuperAdmin only
 */
const activateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUser = req.user;

    // Extract request metadata for audit logging
    const metadata = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    };

    // Activate user using service layer
    const user = await userService.activateUser(userId, currentUser, metadata);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
      message: "User activated successfully.",
    });
  } catch (error) {
    logger.error("Activate user error:", error);

    // Handle custom service errors
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        code: "ACTIVATE_USER_ERROR",
        message: "An error occurred while activating user.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  changeUserRole,
  deactivateUser,
  activateUser,
};
