import { AttendanceRecord, Employee, AttendanceCorrectionRequest } from '../../models/index.js';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import notificationService from '../../services/notificationService.js';

/**
 * Get attendance issues for the current employee
 */
const getAttendanceIssues = async (req, res) => {
  try {
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }
    
    // Get attendance records with potential issues
    const attendanceRecords = await AttendanceRecord.findAll({
      where: {
        employeeId: employee.id,
        [Op.or]: [
          { clockIn: null },
          { clockOut: null },
          // ✅ FIX: Use correctionRequested flag instead of status
          { 
            correctionRequested: true,
            correctionStatus: 'pending'
          }
        ]
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        }
      ],
      order: [['date', 'DESC']],
      limit: 50
    });

    // Transform records to issues format
    const issues = attendanceRecords.map(record => ({
      id: record.id,
      date: record.date,
      clockIn: record.clockIn,
      clockOut: record.clockOut,
      totalBreakMinutes: record.totalBreakMinutes,
      issueType: !record.clockIn ? 'missed_punch' : !record.clockOut ? 'missed_punch' : 'system_error',
      description: !record.clockIn ? 'Missing clock in time' : 
                  !record.clockOut ? 'Missing clock out time' : 
                  'System flagged for correction'
    }));

    res.json({
      success: true,
      data: issues,
      message: 'Attendance issues retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching attendance issues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance issues',
      error: error.message
    });
  }
};

/**
 * Get correction requests for the current employee
 */
const getCorrectionRequests = async (req, res) => {
  try {
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }
    
    const requests = await AttendanceCorrectionRequest.findAll({
      where: { employeeId: employee.id },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: requests,
      message: 'Correction requests retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching correction requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch correction requests',
      error: error.message
    });
  }
};

/**
 * Submit a new correction request
 */
const submitCorrectionRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const {
      date,
      expectedClockIn,
      expectedClockOut,
      breakDuration,
      reason,
      issueType
    } = req.body;

    // Check if there's already a pending request for this date
    const existingRequest = await AttendanceCorrectionRequest.findOne({
      where: {
        employeeId: employee.id,
        date,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A correction request for this date is already pending'
      });
    }

    // ✅ FIX: Find existing attendance record to capture original values
    const existingAttendanceRecord = await AttendanceRecord.findOne({
      where: {
        employeeId: employee.id,
        date
      }
    });

    // Convert time strings to full DATE objects for the requested date
    const requestedClockIn = expectedClockIn ? 
      new Date(`${date}T${expectedClockIn}:00`) : null;
    const requestedClockOut = expectedClockOut ? 
      new Date(`${date}T${expectedClockOut}:00`) : null;

    // Create the correction request
    const correctionRequest = await AttendanceCorrectionRequest.create({
      employeeId: employee.id,
      attendanceRecordId: existingAttendanceRecord?.id || null,
      date,
      requestedClockIn,
      requestedClockOut,
      requestedBreakMinutes: breakDuration || null,
      // ✅ FIX: Populate original values from existing attendance record
      originalClockIn: existingAttendanceRecord?.clockIn || null,
      originalClockOut: existingAttendanceRecord?.clockOut || null,
      originalBreakMinutes: existingAttendanceRecord?.totalBreakMinutes || 0,
      reason,
      issueType: issueType || 'missed_punch',
      status: 'pending'
    });

    // Include employee data in response
    const requestWithEmployee = await AttendanceCorrectionRequest.findByPk(
      correctionRequest.id,
      {
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'firstName', 'lastName', 'employeeId']
          }
        ]
      }
    );

    // Send notification to HR and Admin about new correction request
    try {
      const adminRoles = ['HR', 'SuperAdmin', 'HR_ADMIN', 'SUPER_ADMIN', 'HR_MANAGER'];
      await notificationService.sendToRoles(adminRoles, {
        title: 'New Attendance Correction Request',
        message: `${requestWithEmployee.employee.firstName} ${requestWithEmployee.employee.lastName} has submitted an attendance correction request for ${date}`,
        type: 'info',
        category: 'attendance',
        metadata: {
          correctionRequestId: correctionRequest.id,
          employeeId: employee.id,
          date,
          issueType: issueType || 'missed_punch',
        },
      });
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      data: requestWithEmployee,
      message: 'Correction request submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting correction request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit correction request',
      error: error.message
    });
  }
};

/**
 * Get a specific correction request
 */
const getCorrectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const request = await AttendanceCorrectionRequest.findOne({
      where: { 
        id, 
        employeeId: employee.id // Ensure employee can only see their own requests
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'firstName', 'lastName', 'employeeId']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Correction request not found'
      });
    }

    res.json({
      success: true,
      data: request,
      message: 'Correction request retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching correction request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch correction request',
      error: error.message
    });
  }
};

/**
 * Cancel a pending correction request
 */
const cancelCorrectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find employee by userId
    const employee = await Employee.findOne({
      where: { userId: req.user.id },
      attributes: ['id']
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const request = await AttendanceCorrectionRequest.findOne({
      where: { 
        id, 
        employeeId: employee.id,
        status: 'pending' // Can only cancel pending requests
      }
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Pending correction request not found'
      });
    }

    await request.update({
      status: 'cancelled',
      processedAt: new Date(),
      adminRemarks: 'Cancelled by employee'
    });

    res.json({
      success: true,
      data: request,
      message: 'Correction request cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling correction request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel correction request',
      error: error.message
    });
  }
};

export {
  getAttendanceIssues,
  getCorrectionRequests,
  submitCorrectionRequest,
  getCorrectionRequest,
  cancelCorrectionRequest
};