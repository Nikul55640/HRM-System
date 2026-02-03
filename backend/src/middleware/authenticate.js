import { User } from "../models/sequelize/index.js";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt.js";
import { ROLES, databaseToSystemRole } from "../config/roles.js";

/**
 * Authenticate User - Required
 */
const authenticate = async (req, res, next) => {


  try {
    const token = extractTokenFromHeader(req.headers.authorization, req.cookies);

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Please provide a valid token.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: {
            code: "TOKEN_EXPIRED",
            message: "Access token has expired.",
            timestamp: new Date().toISOString(),
          },
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid access token.",
            timestamp: new Date().toISOString(),
          },
        });
      }

      throw error;
    }

    // Fetch user from DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User does not exist.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // User deactivated
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message: "Your account is deactivated.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Note: Password change tracking not implemented in current Sequelize model
    // This can be added later if needed

    // SUCCESS - Load employee data if exists
    let employeeData = null;
    try {
      // Use the clean User -> Employee relationship
      const { Employee } = await import('../models/sequelize/index.js');
      const employee = await Employee.findOne({ 
        where: { userId: user.id },
        attributes: ['id', 'employeeId', 'firstName', 'lastName']
      });
      
      if (employee) {
        employeeData = {
          id: employee.id,
          employeeId: employee.employeeId,
          fullName: `${employee.firstName} ${employee.lastName}`
        };
      } else {
        console.warn(`⚠️ [AUTH] No employee profile found for user ${user.id} (${user.email})`);
        // For SuperAdmin users, this might be expected
        const userSystemRole = user.systemRole || user.role;
        if (userSystemRole === ROLES.SUPER_ADMIN) {
          console.log('ℹ️ [AUTH] SuperAdmin user without employee profile - this is acceptable');
        }
      }
    } catch (error) {
      console.warn('Could not load employee data:', error.message);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role, // Keep original role from database
      systemRole: databaseToSystemRole(user.role), // Add standardized system role
      assignedDepartments: user.assignedDepartments || [],
      employee: employeeData, // New structure
      // Backward compatibility - provide employeeId directly
      employeeId: employeeData?.id || null,
      fullName: employeeData?.fullName || user.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "An authentication error occurred.",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Optional Authentication
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization, req.cookies);

    if (!token) return next();

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next();
    }

    const user = await User.findByPk(decoded.id);

    if (user && user.isActive) {
      // Use the clean User -> Employee relationship for optional auth too
      let employeeData = null;
      try {
        const { Employee } = await import('../models/sequelize/index.js');
        const employee = await Employee.findOne({ 
          where: { userId: user.id },
          attributes: ['id', 'employeeId', 'firstName', 'lastName']
        });
        
        if (employee) {
          employeeData = {
            id: employee.id,
            employeeId: employee.employeeId,
            fullName: `${employee.firstName} ${employee.lastName}`
          };
        }
      } catch (error) {
        console.warn('Could not load employee data:', error.message);
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role, // Keep original role from database
        systemRole: databaseToSystemRole(user.role), // Add standardized system role
        assignedDepartments: user.assignedDepartments || [],
        employee: employeeData,
        // Backward compatibility - provide employeeId directly
        employeeId: employeeData?.id || null,
        fullName: employeeData?.fullName || user.email,
      };
    }

    next();
  } catch (err) {
    console.error("Optional authentication error:", err);
    next();
  }
};

/**
 * Authorization Middleware (with role normalization)
 */
const authorize = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required.",
        timestamp: new Date().toISOString(),
      },
    });
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  // Use systemRole for authorization checks (standardized constants)
  const userSystemRole = req.user.systemRole;
  
  if (!allowedRoles.includes(userSystemRole)) {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You do not have permission.",
        details: {
          requiredRoles: allowedRoles,
          userRole: userSystemRole,
          allowedRoles: allowedRoles
        },
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

export { authenticate, optionalAuthenticate, authorize };
