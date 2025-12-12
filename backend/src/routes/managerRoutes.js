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
    const userRole = req.user.role;
    
    let query = { status: { $in: ['Active', 'On Leave'] } };
    
    // SuperAdmin and HR can see all employees, managers only see their team
    if (managerId && !['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
      query['jobInfo.manager'] = managerId;
    } else if (!managerId && ['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
      // SuperAdmin/HR without employeeId can see all employees
      // Keep the query as is (all active employees)
    } else if (!managerId) {
      // Regular user without employeeId has no team
      return res.json({
        success: true,
        data: [],
        message: 'No team members found - user not associated with employee record',
      });
    }
    
    const team = await Employee.find(query)
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
    // Import models with better error handling
    let LeaveRequest, AttendanceRecord;
    
    try {
      const leaveModule = await import('../models/LeaveRequest.js');
      LeaveRequest = leaveModule.default || leaveModule.LeaveRequest;
      
      const attendanceModule = await import('../models/AttendanceRecord.js');
      AttendanceRecord = attendanceModule.default || attendanceModule.AttendanceRecord;
    } catch (importError) {
      console.error('Error importing models:', importError);
      return res.status(500).json({
        success: false,
        message: 'Database models not available',
        error: 'Model import failed',
      });
    }
    
    const managerId = req.user.employeeId;
    const userRole = req.user.role;
    
    // SuperAdmin and HR roles can see all approvals, others need employeeId
    if (!managerId && !['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Manager ID not found in user context',
        error: 'User is not associated with an employee record',
      });
    }
    
    let filteredLeaves = [];
    let filteredAttendance = [];
    
    // Get pending leave requests for team members
    try {
      if (LeaveRequest && typeof LeaveRequest.find === 'function') {
        let leaveQuery = { status: 'pending' };
        let populateOptions = {
          path: 'employeeId',
          select: 'employeeId personalInfo jobInfo',
        };

        // SuperAdmin and HR can see all requests, managers only see their team
        if (managerId && !['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
          populateOptions.match = { 'jobInfo.manager': managerId };
        }

        const leaveRequests = await LeaveRequest.find(leaveQuery)
          .populate(populateOptions)
          .lean();

        // Filter out null employeeId (not in team for managers)
        if (managerId && !['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
          filteredLeaves = leaveRequests.filter(req => req.employeeId !== null);
        } else {
          // SuperAdmin/HR see all requests
          filteredLeaves = leaveRequests.filter(req => req.employeeId !== null);
        }
      }
    } catch (leaveError) {
      console.error('Error fetching leave requests:', leaveError);
      // Continue with empty array
    }

    // Get pending attendance corrections
    try {
      if (AttendanceRecord && typeof AttendanceRecord.find === 'function') {
        let attendanceQuery = { approvalStatus: 'pending' };
        let populateOptions = {
          path: 'employeeId',
          select: 'employeeId personalInfo jobInfo',
        };

        // SuperAdmin and HR can see all requests, managers only see their team
        if (managerId && !['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
          populateOptions.match = { 'jobInfo.manager': managerId };
        }

        const attendanceRequests = await AttendanceRecord.find(attendanceQuery)
          .populate(populateOptions)
          .lean();

        // Filter out null employeeId (not in team for managers)
        if (managerId && !['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(userRole)) {
          filteredAttendance = attendanceRequests.filter(req => req.employeeId !== null);
        } else {
          // SuperAdmin/HR see all requests
          filteredAttendance = attendanceRequests.filter(req => req.employeeId !== null);
        }
      }
    } catch (attendanceError) {
      console.error('Error fetching attendance requests:', attendanceError);
      // Continue with empty array
    }

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
