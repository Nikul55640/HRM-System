import { User } from "../models/sequelize/index.js";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt.js";

/**
 * Authenticate User - Required
 */
const authenticate = async (req, res, next) => {


  try {
    const token = extractTokenFromHeader(req.headers.authorization);

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
      // Try to get employee data through the new relationship
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
      role: user.role,
      assignedDepartments: user.assignedDepartments || [],
      employee: employeeData, // New structure
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
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) return next();

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next();
    }

    const user = await User.findByPk(decoded.id);

    if (user && user.isActive) {
      // Try to get employee data for optional auth too
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
        role: user.role,
        assignedDepartments: user.assignedDepartments || [],
        employee: employeeData,
      };
    }

    next();
  } catch (err) {
    console.error("Optional authentication error:", err);
    next();
  }
};

/**
 * Authorization Middleware
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

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You do not have permission.",
        details: {
          requiredRoles: allowedRoles,
          userRole: req.user.role,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

export { authenticate, optionalAuthenticate, authorize };
