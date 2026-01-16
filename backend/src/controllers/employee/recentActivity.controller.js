import recentActivityService from '../../services/employee/recentActivity.service.js';

class RecentActivityController {
  /**
   * Get recent activities for the authenticated employee
   */
  async getMyRecentActivities(req, res) {
    try {
      const employeeId = req.user.employeeId;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID not found in request'
        });
      }

      const {
        limit = 10,
        days = 7,
        types
      } = req.query;

      // Parse types if provided
      let activityTypes = null;
      if (types) {
        activityTypes = Array.isArray(types) ? types : types.split(',');
      }

      const result = await recentActivityService.getRecentActivities(employeeId, {
        limit: parseInt(limit),
        days: parseInt(days),
        types: activityTypes
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Recent activities retrieved successfully',
          data: result.data,
          total: result.total,
          meta: {
            limit: parseInt(limit),
            days: parseInt(days),
            types: activityTypes
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: result.error || 'Failed to fetch recent activities',
          data: []
        });
      }

    } catch (error) {
      console.error('Error in getMyRecentActivities:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching recent activities',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get activity statistics for the authenticated employee
   */
  async getActivityStats(req, res) {
    try {
      const employeeId = req.user.employeeId;
      
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID not found in request'
        });
      }

      const { days = 7 } = req.query;

      // Get activities for different types
      const [
        attendanceResult,
        leaveResult,
        correctionResult,
        leadResult
      ] = await Promise.all([
        recentActivityService.getRecentActivities(employeeId, { 
          days: parseInt(days), 
          types: ['attendance'],
          limit: 100 
        }),
        recentActivityService.getRecentActivities(employeeId, { 
          days: parseInt(days), 
          types: ['leave'],
          limit: 100 
        }),
        recentActivityService.getRecentActivities(employeeId, { 
          days: parseInt(days), 
          types: ['correction'],
          limit: 100 
        }),
        recentActivityService.getRecentActivities(employeeId, { 
          days: parseInt(days), 
          types: ['lead'],
          limit: 100 
        })
      ]);

      const stats = {
        attendance: attendanceResult.success ? attendanceResult.data.length : 0,
        leave: leaveResult.success ? leaveResult.data.length : 0,
        corrections: correctionResult.success ? correctionResult.data.length : 0,
        leads: leadResult.success ? leadResult.data.length : 0,
        total: 0
      };

      stats.total = stats.attendance + stats.leave + stats.corrections + stats.leads;

      return res.status(200).json({
        success: true,
        message: 'Activity statistics retrieved successfully',
        data: stats,
        meta: {
          days: parseInt(days)
        }
      });

    } catch (error) {
      console.error('Error in getActivityStats:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching activity statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new RecentActivityController();