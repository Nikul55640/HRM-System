import adminDashboardService from "../../services/adminDashboardService.js";

const adminDashboardController = {
  getDashboardStats: async (req, res) => {
    try {
      // Get full dashboard statistics
      const data = await adminDashboardService.getDashboardStats();

      return res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data,
      });

    } catch (error) {
      console.error("❌ [ADMIN DASHBOARD ERROR]:", error);

      return res.status(error.statusCode || 500).json({
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
