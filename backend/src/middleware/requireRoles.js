// middleware/requireRoles.js

const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // user injected from authenticate.js
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No user found in request",
        });
      }

      const userRole = user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Requires one of [${allowedRoles.join(
            ", "
          )}] roles`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role authorization error",
        error: error.message,
      });
    }
  };
};

export { requireRoles };