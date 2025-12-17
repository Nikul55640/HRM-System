import adminDashboardService from "../../services/admin/adminDashboard.service.js";

const adminDashboardController = {
  getDashboardStats: async (req, res) => {
    try {
      const data = await adminDashboardService.getDashboardStats();

      return res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data,
      });
    } catch (error) {
      console.error("❌ [ADMIN DASHBOARD CONTROLLER ERROR]", {
        message: error.message,
        stack: error.stack,
      });

      const statusCode = error.statusCode || 500;

      return res.status(statusCode).json({
        success: false,
        error: {
          code: error.code || "DASHBOARD_FETCH_FAILED",
          message: error.message || "Failed to fetch dashboard statistics.",
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
};

export default adminDashboardController;
