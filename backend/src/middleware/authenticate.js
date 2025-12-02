import User from "../models/User.js";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt.js";

/**
 * Authenticate User - Required
 */
const authenticate = async (req, res, next) => {
  console.log("\n================ AUTH CHECK ================");
  console.log("[AUTH] Incoming Request:", req.method, req.originalUrl);

  try {
    const rawHeader = req.headers.authorization;
    console.log("[AUTH] Authorization Header:", rawHeader);

    const token = extractTokenFromHeader(rawHeader);
    console.log("[AUTH] Extracted Token:", token);

    // No token
    if (!token) {
      console.log("❌ No token provided");
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
      console.log("[AUTH] Verifying token...");
      decoded = verifyAccessToken(token);
      console.log("✅ Token decoded:", decoded);
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);

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
    console.log("[AUTH] Fetching user:", decoded.id);
    const user = await User.findById(decoded.id).select("+passwordChangedAt");

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User does not exist.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    console.log("✅ User found:", user.email);

    // User deactivated
    if (!user.isActive) {
      console.log("❌ User is deactivated");
      return res.status(401).json({
        success: false,
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message: "Your account is deactivated.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Password changed after token issued
    if (user.changedPasswordAfter(decoded.iat)) {
      console.log("❌ Password changed after token issued");
      return res.status(401).json({
        success: false,
        error: {
          code: "PASSWORD_CHANGED",
          message: "Password was changed recently.",
          timestamp: new Date().toISOString(),
        },
      });
    }

    // SUCCESS
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      assignedDepartments: user.assignedDepartments || [],
      employeeId: decoded.employeeId, // ✅ CORRECT
    };

    console.log("✅ AUTH SUCCESS:", req.user);
    console.log("=============================================\n");

    next();
  } catch (error) {
    console.error("🔥 AUTH MIDDLEWARE ERROR:", error);

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
  console.log("\n[OPTIONAL AUTH] Checking token...");
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    console.log("[OPTIONAL AUTH] Token:", token);

    if (!token) return next();

    let decoded;
    try {
      decoded = verifyAccessToken(token);
      console.log("[OPTIONAL AUTH] Decoded:", decoded);
    } catch {
      console.log("[OPTIONAL AUTH] Invalid or expired token");
      return next();
    }

    const user = await User.findById(decoded.id);

    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        assignedDepartments: user.assignedDepartments || [],
        employeeId: user.employeeId,
      };
      console.log("[OPTIONAL AUTH] User set:", req.user);
    }

    next();
  } catch (err) {
    console.error("🔥 OPTIONAL AUTH ERROR:", err);
    next();
  }
};

/**
 * Authorization Middleware
 */
const authorize = (roles) => (req, res, next) => {
  console.log("\n🔐 AUTHORIZATION CHECK");
  console.log("[AUTHZ] Required Roles:", roles);
  console.log("[AUTHZ] User:", req.user);

  if (!req.user) {
    console.log("❌ No user found in req");
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
    console.log(
      `❌ Forbidden: user role ${req.user.role} not in required roles ${allowedRoles}`
    );

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

  console.log("✅ Authorization success");
  next();
};

export { authenticate, optionalAuthenticate, authorize };
