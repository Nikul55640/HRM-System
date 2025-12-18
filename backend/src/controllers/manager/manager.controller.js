import { User, Employee, LeaveRequest, AttendanceRecord } from "../../models/sequelize/index.js";
import { Op } from "sequelize";

/**
 * Manager Controller
 * Handles manager-specific operations:
 * - Team management
 * - Leave approvals
 * - Attendance correction approvals
 * - Team reports and analytics
 */

const managerController = {
  /**
   * GET /api/manager/dashboard
   * Get manager dashboard with team stats
   */
  getDashboard: async (req, res) => {
    try {
      const managerId = req.user.id;

      // Get manager's managed employees
      const teamMembers = await Employee.findAll({
        where: { managerId },
        attributes: ['id', 'personalInfo', 'jobInfo', 'employeeId'],
      });

      const teamCount = teamMembers.length;

      // Get pending leave requests for team
      const pendingLeaveRequests = await LeaveRequest.findAll({
        include: [
          {
            model: Employee,
            where: { managerId },
            attributes: ['id', 'personalInfo', 'employeeId'],
          },
        ],
        where: { status: 'Pending' },
        attributes: ['id', 'leaveType', 'startDate', 'endDate', 'status'],
      });

      // Get pending attendance corrections for team
      const pendingCorrections = await AttendanceRecord.findAll({
        include: [
          {
            model: Employee,
            where: { managerId },
            attributes: ['id', 'personalInfo', 'employeeId'],
          },
        ],
        where: { status: 'pending_correction' },
        attributes: ['id', 'date', 'checkInTime', 'checkOutTime', 'status'],
      });

      // Get today's attendance for team
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await AttendanceRecord.findAll({
        include: [
          {
            model: Employee,
            where: { managerId },
            attributes: ['id', 'personalInfo', 'employeeId'],
          },
        ],
        where: {
          date: today,
        },
        attributes: ['id', 'status', 'checkInTime', 'checkOutTime'],
      });

      res.status(200).json({
        success: true,
        data: {
          teamCount,
          pendingLeaveRequests: pendingLeaveRequests.length,
          pendingCorrections: pendingCorrections.length,
          presentToday: todayAttendance.filter((a) => a.status === 'Present').length,
          dashboard: {
            teamMembers: teamCount,
            pendingApprovals: pendingLeaveRequests.length + pendingCorrections.length,
            presentToday: todayAttendance.filter((a) => a.status === 'Present').length,
            absentToday: todayAttendance.filter((a) => a.status === 'Absent').length,
          },
        },
        message: 'Manager dashboard fetched successfully',
      });
    } catch (error) {
      console.error('❌ [MANAGER DASHBOARD ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DASHBOARD_ERROR',
          message: 'Failed to fetch manager dashboard',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/team
   * Get manager's team members
   */
  getTeam: async (req, res) => {
    try {
      const managerId = req.user.id;

      const teamMembers = await Employee.findAll({
        where: { managerId },
        attributes: ['id', 'personalInfo', 'jobInfo', 'employeeId', 'status'],
        include: [
          {
            model: User,
            attributes: ['id', 'email'],
            required: false,
          },
        ],
        order: [['personalInfo', 'firstName']],
      });

      res.status(200).json({
        success: true,
        data: teamMembers,
        message: 'Team members fetched successfully',
      });
    } catch (error) {
      console.error('❌ [GET TEAM ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'TEAM_FETCH_ERROR',
          message: 'Failed to fetch team members',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/team/:employeeId
   * Get specific team member details
   */
  getTeamMember: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { employeeId } = req.params;

      const employee = await Employee.findOne({
        where: { id: employeeId, managerId },
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'role'],
            required: false,
          },
        ],
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EMPLOYEE_NOT_FOUND',
            message: 'Employee not found or not in your team',
            timestamp: new Date().toISOString(),
          },
        });
      }

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Team member details fetched successfully',
      });
    } catch (error) {
      console.error('❌ [GET TEAM MEMBER ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MEMBER_FETCH_ERROR',
          message: 'Failed to fetch team member details',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/team-stats
   * Get team performance statistics
   */
  getTeamStats: async (req, res) => {
    try {
      const managerId = req.user.id;

      // Get team stats
      const teamMembers = await Employee.findAll({
        where: { managerId },
      });

      const memberIds = teamMembers.map((m) => m.id);

      // Get attendance stats
      const attendanceStats = await AttendanceRecord.findAll({
        where: { employeeId: { [Op.in]: memberIds } },
        attributes: ['status'],
        raw: true,
      });

      const stats = {
        totalMembers: teamMembers.length,
        totalPresent: attendanceStats.filter((a) => a.status === 'Present').length,
        totalAbsent: attendanceStats.filter((a) => a.status === 'Absent').length,
        totalLeave: attendanceStats.filter((a) => a.status === 'Leave').length,
        attendanceRate: teamMembers.length > 0
          ? ((attendanceStats.filter((a) => a.status === 'Present').length / teamMembers.length) * 100).toFixed(2)
          : 0,
      };

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Team statistics fetched successfully',
      });
    } catch (error) {
      console.error('❌ [TEAM STATS ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to fetch team statistics',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/leave-requests
   * Get pending leave requests from team
   */
  getLeaveRequests: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { status } = req.query;

      const teamMembers = await Employee.findAll({
        where: { managerId },
      });

      const memberIds = teamMembers.map((m) => m.id);

      const whereClause = { employeeId: { [Op.in]: memberIds } };
      if (status) {
        whereClause.status = status;
      }

      const leaveRequests = await LeaveRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            attributes: ['id', 'personalInfo', 'employeeId'],
            required: true,
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: leaveRequests,
        message: 'Leave requests fetched successfully',
      });
    } catch (error) {
      console.error('❌ [GET LEAVE REQUESTS ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LEAVE_FETCH_ERROR',
          message: 'Failed to fetch leave requests',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * PUT /api/manager/leave-requests/:id/approve
   * Approve a leave request
   */
  approveLeaveRequest: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { id } = req.params;
      const { comment } = req.body;

      const leaveRequest = await LeaveRequest.findByPk(id, {
        include: [
          {
            model: Employee,
            where: { managerId },
            required: true,
          },
        ],
      });

      if (!leaveRequest) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LEAVE_REQUEST_NOT_FOUND',
            message: 'Leave request not found or not in your team',
            timestamp: new Date().toISOString(),
          },
        });
      }

      leaveRequest.status = 'Approved';
      leaveRequest.approvedBy = managerId;
      leaveRequest.approvalDate = new Date();
      if (comment) {
        leaveRequest.managerComment = comment;
      }
      await leaveRequest.save();

      res.status(200).json({
        success: true,
        data: leaveRequest,
        message: 'Leave request approved successfully',
      });
    } catch (error) {
      console.error('❌ [APPROVE LEAVE ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'APPROVAL_ERROR',
          message: 'Failed to approve leave request',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * PUT /api/manager/leave-requests/:id/reject
   * Reject a leave request
   */
  rejectLeaveRequest: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const leaveRequest = await LeaveRequest.findByPk(id, {
        include: [
          {
            model: Employee,
            where: { managerId },
            required: true,
          },
        ],
      });

      if (!leaveRequest) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LEAVE_REQUEST_NOT_FOUND',
            message: 'Leave request not found or not in your team',
            timestamp: new Date().toISOString(),
          },
        });
      }

      leaveRequest.status = 'Rejected';
      leaveRequest.rejectedBy = managerId;
      leaveRequest.rejectionDate = new Date();
      if (reason) {
        leaveRequest.rejectionReason = reason;
      }
      await leaveRequest.save();

      res.status(200).json({
        success: true,
        data: leaveRequest,
        message: 'Leave request rejected successfully',
      });
    } catch (error) {
      console.error('❌ [REJECT LEAVE ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REJECTION_ERROR',
          message: 'Failed to reject leave request',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/attendance-corrections
   * Get pending attendance corrections from team
   */
  getAttendanceCorrections: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { status = 'pending_correction' } = req.query;

      const teamMembers = await Employee.findAll({
        where: { managerId },
      });

      const memberIds = teamMembers.map((m) => m.id);

      const whereClause = { employeeId: { [Op.in]: memberIds }, status: 'pending_correction' };

      const corrections = await AttendanceRecord.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            attributes: ['id', 'personalInfo', 'employeeId'],
            required: true,
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: corrections,
        message: 'Attendance corrections fetched successfully',
      });
    } catch (error) {
      console.error('❌ [GET CORRECTIONS ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CORRECTIONS_FETCH_ERROR',
          message: 'Failed to fetch attendance corrections',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * PUT /api/manager/attendance-corrections/:id/approve
   * Approve an attendance correction
   */
  approveAttendanceCorrection: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { id } = req.params;
      const { comment } = req.body;

      const correction = await AttendanceRecord.findByPk(id, {
        include: [
          {
            model: Employee,
            where: { managerId },
            required: true,
          },
        ],
      });

      if (!correction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CORRECTION_NOT_FOUND',
            message: 'Correction request not found or not in your team',
            timestamp: new Date().toISOString(),
          },
        });
      }

      correction.status = 'Approved';
      correction.approvedBy = managerId;
      correction.approvalDate = new Date();
      if (comment) {
        correction.managerComment = comment;
      }
      await correction.save();

      res.status(200).json({
        success: true,
        data: correction,
        message: 'Attendance correction approved successfully',
      });
    } catch (error) {
      console.error('❌ [APPROVE CORRECTION ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'APPROVAL_ERROR',
          message: 'Failed to approve correction',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * PUT /api/manager/attendance-corrections/:id/reject
   * Reject an attendance correction
   */
  rejectAttendanceCorrection: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const correction = await AttendanceRecord.findByPk(id, {
        include: [
          {
            model: Employee,
            where: { managerId },
            required: true,
          },
        ],
      });

      if (!correction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CORRECTION_NOT_FOUND',
            message: 'Correction request not found or not in your team',
            timestamp: new Date().toISOString(),
          },
        });
      }

      correction.status = 'Rejected';
      correction.rejectedBy = managerId;
      correction.rejectionDate = new Date();
      if (reason) {
        correction.rejectionReason = reason;
      }
      await correction.save();

      res.status(200).json({
        success: true,
        data: correction,
        message: 'Attendance correction rejected successfully',
      });
    } catch (error) {
      console.error('❌ [REJECT CORRECTION ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REJECTION_ERROR',
          message: 'Failed to reject correction',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/team-attendance
   * Get team attendance summary for a date range
   */
  getTeamAttendance: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { fromDate, toDate } = req.query;

      const teamMembers = await Employee.findAll({
        where: { managerId },
      });

      const memberIds = teamMembers.map((m) => m.id);

      const whereClause = { employeeId: { [Op.in]: memberIds } };

      if (fromDate || toDate) {
        whereClause.date = {};
        if (fromDate) {
          whereClause.date[Op.gte] = new Date(fromDate).toISOString().split('T')[0];
        }
        if (toDate) {
          whereClause.date[Op.lte] = new Date(toDate).toISOString().split('T')[0];
        }
      }

      const attendance = await AttendanceRecord.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            attributes: ['id', 'personalInfo', 'employeeId'],
            required: true,
          },
        ],
        order: [['date', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: attendance,
        message: 'Team attendance fetched successfully',
      });
    } catch (error) {
      console.error('❌ [GET TEAM ATTENDANCE ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ATTENDANCE_FETCH_ERROR',
          message: 'Failed to fetch team attendance',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/reports/attendance
   * Get team attendance report
   */
  getAttendanceReport: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { month, year } = req.query;

      const teamMembers = await Employee.findAll({
        where: { managerId },
      });

      const memberIds = teamMembers.map((m) => m.id);

      // Build date filter
      let whereClause = { employeeId: { [Op.in]: memberIds } };

      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        whereClause.date = {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0],
        };
      }

      const attendance = await AttendanceRecord.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            attributes: ['id', 'personalInfo', 'employeeId'],
            required: true,
          },
        ],
      });

      // Calculate stats by employee
      const reportData = {};

      teamMembers.forEach((member) => {
        reportData[member.id] = {
          employee: member,
          present: 0,
          absent: 0,
          leave: 0,
          halfDay: 0,
          total: 0,
        };
      });

      attendance.forEach((record) => {
        if (reportData[record.employeeId]) {
          reportData[record.employeeId][record.status.toLowerCase()]++;
          reportData[record.employeeId].total++;
        }
      });

      res.status(200).json({
        success: true,
        data: Object.values(reportData),
        message: 'Attendance report generated successfully',
      });
    } catch (error) {
      console.error('❌ [ATTENDANCE REPORT ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REPORT_ERROR',
          message: 'Failed to generate attendance report',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },

  /**
   * GET /api/manager/reports/leave
   * Get team leave report
   */
  getLeaveReport: async (req, res) => {
    try {
      const managerId = req.user.id;
      const { month, year } = req.query;

      const teamMembers = await Employee.findAll({
        where: { managerId },
      });

      const memberIds = teamMembers.map((m) => m.id);

      let whereClause = { employeeId: { [Op.in]: memberIds } };

      if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        whereClause.startDate = {
          [Op.lte]: endDate.toISOString().split('T')[0],
        };
        whereClause.endDate = {
          [Op.gte]: startDate.toISOString().split('T')[0],
        };
      }

      const leaveRequests = await LeaveRequest.findAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            attributes: ['id', 'personalInfo', 'employeeId'],
            required: true,
          },
        ],
      });

      res.status(200).json({
        success: true,
        data: leaveRequests,
        message: 'Leave report generated successfully',
      });
    } catch (error) {
      console.error('❌ [LEAVE REPORT ERROR]:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REPORT_ERROR',
          message: 'Failed to generate leave report',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
};

export default managerController;
