import dashboardService from '../../services/employee/dashboard.service.js';
import logger from '../../utils/logger.js';

/**
 * Dashboard Controller
 * Handles HTTP requests for employee self-service dashboard
 */

/**
 * Get complete dashboard data for authenticated employee
 * @route GET /api/dashboard
 * @access Employee (own dashboard only)
 */
const getDashboard = async (req, res, next) => {
  try {
    const { user } = req;

    console.log('📊 [DASHBOARD] Get dashboard request:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      hasEmployeeId: !!user.employeeId,
    });

    // Check if user has employee profile
    if (!user.employeeId) {
      console.log('⚠️ [DASHBOARD] User has no employee profile');
      return res.status(200).json({
        success: true,
        data: {
          hasEmployeeProfile: !!user.employeeId,
          user: {
            email: user.email,
            role: user.role,
          },
          message: 'Dashboard data is only available for users with employee profiles.',
        },
      });
    }

    // Parse query options
    const options = {
      attendanceLimit: parseInt(req.query.attendanceLimit, 10) || 10,
      activityLimit: parseInt(req.query.activityLimit, 10) || 20,
    };

    console.log('🔍 [DASHBOARD] Fetching dashboard data for employee:', user.employeeId);
    const dashboardData = await dashboardService.getDashboardData(user, options);
    console.log('✅ [DASHBOARD] Dashboard data retrieved successfully');

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('💥 [DASHBOARD] Error:', {
      message: error.message,
      stack: error.stack,
    });
    logger.error('Error in getDashboard controller:', error);
    next(error);
  }
};

/**
 * Get employee profile summary
 * @route GET /api/dashboard/profile
 * @access Employee (own profile only)
 */
const getProfileSummary = async (req, res, next) => {
  try {
    const { user } = req;

    const profileSummary = await dashboardService.getEmployeeProfileSummary(user);

    res.status(200).json({
      success: true,
      data: profileSummary,
    });
  } catch (error) {
    logger.error('Error in getProfileSummary controller:', error);
    next(error);
  }
};

/**
 * Get leave balance (placeholder)
 * @route GET /api/dashboard/leave
 * @access Employee (own leave balance only)
 */
const getLeaveBalance = async (req, res, next) => {
  try {
    const { user } = req;

    const leaveBalance = await dashboardService.getLeaveBalance(user);

    res.status(200).json({
      success: true,
      data: leaveBalance,
    });
  } catch (error) {
    logger.error('Error in getLeaveBalance controller:', error);
    next(error);
  }
};

/**
 * Get attendance records (placeholder)
 * @route GET /api/dashboard/attendance
 * @access Employee (own attendance only)
 */
const getAttendanceRecords = async (req, res, next) => {
  try {
    const { user } = req;

    // Parse query options
    const options = {
      limit: parseInt(req.query.limit, 10) || 10,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
    };

    const attendanceRecords = await dashboardService.getAttendanceRecords(user, options);

    res.status(200).json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    logger.error('Error in getAttendanceRecords controller:', error);
    next(error);
  }
};

/**
 * Get recent activity feed
 * @route GET /api/dashboard/activity
 * @access Employee (own activity only)
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const { user } = req;

    // Parse query options
    const options = {
      limit: parseInt(req.query.limit, 10) || 20,
      skip: parseInt(req.query.skip, 10) || 0,
    };

    const activityData = await dashboardService.getRecentActivity(user, options);

    res.status(200).json({
      success: true,
      data: activityData.activities,
      pagination: activityData.pagination,
    });
  } catch (error) {
    logger.error('Error in getRecentActivity controller:', error);
    next(error);
  }
};

export default { getDashboard, getProfileSummary, getLeaveBalance, getAttendanceRecords, getRecentActivity };
