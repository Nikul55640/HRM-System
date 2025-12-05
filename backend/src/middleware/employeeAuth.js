import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateEmployee = async (req, res, next) => {
  try {
    console.log("🔐 [EMPLOYEE AUTH] Authenticating employee request:", {
      path: req.path,
      method: req.method,
      hasAuth: !!req.headers.authorization,
    });

    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("❌ [EMPLOYEE AUTH] No token provided");
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_TOKEN",
          message: "No token provided",
        },
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [EMPLOYEE AUTH] Token verified:", { userId: decoded.id });

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ [EMPLOYEE AUTH] User not found:", { userId: decoded.id });
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    console.log("👤 [EMPLOYEE AUTH] User loaded:", {
      userId: user._id,
      email: user.email,
      role: user.role,
      hasEmployeeId: !!user.employeeId,
    });

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ [EMPLOYEE AUTH] Account inactive:", { userId: user._id });
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCOUNT_INACTIVE",
          message: "Account is inactive",
        },
      });
    }

    // CRITICAL: Check if user has an associated employee profile
    if (!user.employeeId) {
      console.log("⚠️ [EMPLOYEE AUTH] No employee profile:", {
        userId: user._id,
        email: user.email,
        role: user.role,
      });
      return res.status(403).json({
        success: false,
        error: {
          code: "NO_EMPLOYEE_PROFILE",
          message:
            "This user account is not linked to an employee profile. Employee self-service features are only available to users with employee profiles.",
          details: {
            suggestion:
              "Please contact your HR administrator to link your account to an employee profile.",
          },
        },
      });
    }

    // Attach user to request
    req.user = user;
    req.user.employeeId = user.employeeId;

    console.log("✅ [EMPLOYEE AUTH] Authentication successful:", {
      userId: user._id,
      employeeId: user.employeeId,
    });

    next();
  } catch (error) {
    console.error("💥 [EMPLOYEE AUTH] Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token",
        },
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Token expired",
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: error.message,
      },
    });
  }
};

// Verify employee can only access own data
export const verifyOwnData = (req, res, next) => {
  const requestedEmployeeId = req.params.employeeId || req.body.employeeId;

  console.log("🔍 [VERIFY OWN DATA] Checking access:", {
    requestedEmployeeId,
    userEmployeeId: req.user.employeeId,
    match: requestedEmployeeId === req.user.employeeId?.toString(),
  });

  if (
    requestedEmployeeId &&
    requestedEmployeeId !== req.user.employeeId?.toString()
  ) {
    console.log("❌ [VERIFY OWN DATA] Unauthorized access attempt");
    return res.status(403).json({
      success: false,
      error: {
        code: "UNAUTHORIZED_ACCESS",
        message: "Unauthorized access",
      },
    });
  }

  console.log("✅ [VERIFY OWN DATA] Access granted");
  next();
};
