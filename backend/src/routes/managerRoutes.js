import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../middleware/checkPermission.js';
import { MODULES } from '../config/rolePermissions.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get team members
// Permission: VIEW_TEAM
router.get('/team',
  checkPermission(MODULES.EMPLOYEE.VIEW_TEAM),
  async (req, res) => {
  try {
    const { Employee } = await import('../models/Employee.js');
    
    // Get employees managed by this user
    const managerId = req.user.employeeId;
    
    const team = await Employee.find({ 
      'jobInfo.manager': managerId,
      status: { $in: ['Active', 'On Leave'] }
    })
    .populate('jobInfo.department', 'name')
    .select('employeeId personalInfo contactInfo jobInfo status')
    .lean();

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message,
    });
  }
});

// Get pending approvals
// Permission: APPROVE_TEAM (for leave) or APPROVE_CORRECTION (for attendance)
router.get('/approvals',
  checkAnyPermission([
    MODULES.LEAVE.APPROVE_TEAM,
    MODULES.ATTENDANCE.APPROVE_CORRECTION,
  ]),
  async (req, res) => {
  try {
    const { LeaveRequest } = await import('../models/LeaveRequest.js');
    const { AttendanceRecord } = await import('../models/AttendanceRecord.js');
    
    const managerId = req.user.employeeId;
    
    // Get pending leave requests for team members
    const leaveRequests = await LeaveRequest.find({
      status: 'pending',
    })
    .populate({
      path: 'employeeId',
      match: { 'jobInfo.manager': managerId },
      select: 'employeeId personalInfo',
    })
    .lean();

    // Filter out null employeeId (not in team)
    const filteredLeaves = leaveRequests.filter(req => req.employeeId !== null);

    // Get pending attendance corrections
    const attendanceRequests = await AttendanceRecord.find({
      approvalStatus: 'pending',
    })
    .populate({
      path: 'employeeId',
      match: { 'jobInfo.manager': managerId },
      select: 'employeeId personalInfo',
    })
    .lean();

    const filteredAttendance = attendanceRequests.filter(req => req.employeeId !== null);

    res.json({
      success: true,
      data: {
        leave: filteredLeaves,
        attendance: filteredAttendance,
        expense: [], // Placeholder for future expense module
      },
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals',
      error: error.message,
    });
  }
});

// Approve leave request
// Permission: APPROVE_TEAM
router.put('/leave/:id/approve',
  checkPermission(MODULES.LEAVE.APPROVE_TEAM),
  async (req, res) => {
  try {
    const { LeaveRequest } = await import('../models/LeaveRequest.js');
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    res.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request approved',
    });
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve leave request',
      error: error.message,
    });
  }
});

// Reject leave request
// Permission: APPROVE_TEAM
router.put('/leave/:id/reject',
  checkPermission(MODULES.LEAVE.APPROVE_TEAM),
  async (req, res) => {
  try {
    const { LeaveRequest } = await import('../models/LeaveRequest.js');
    const { reason } = req.body;
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found',
      });
    }

    res.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request rejected',
    });
  } catch (error) {
    console.error('Error rejecting leave:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject leave request',
      error: error.message,
    });
  }
});

// Get team reports
// Permission: VIEW_TEAM
router.get('/reports',
  checkPermission(MODULES.REPORTS.VIEW_TEAM),
  async (req, res) => {
  try {
    const { Employee } = await import('../models/Employee.js');
    const { AttendanceRecord } = await import('../models/AttendanceRecord.js');
    
    const managerId = req.user.employeeId;
    
    // Get team size
    const teamSize = await Employee.countDocuments({
      'jobInfo.manager': managerId,
      status: 'Active',
    });

    // Get attendance rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendanceStats = await AttendanceRecord.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      {
        $match: {
          'employee.jobInfo.manager': managerId,
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
          avgWorkHours: { $avg: '$workHours' },
        },
      },
    ]);

    const stats = attendanceStats[0] || {
      totalDays: 0,
      presentDays: 0,
      avgWorkHours: 0,
    };

    const attendanceRate = stats.totalDays > 0 
      ? ((stats.presentDays / stats.totalDays) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        teamSize,
        attendanceRate,
        avgWorkHours: stats.avgWorkHours?.toFixed(1) || 0,
        performance: 4.2, // Placeholder
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team reports',
      error: error.message,
    });
  }
});

export default router;
