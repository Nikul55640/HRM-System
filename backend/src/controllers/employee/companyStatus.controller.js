/**
 * Employee Company Status Controller
 * Provides READ-ONLY, LIMITED company-wide status data for employees
 * WITHOUT exposing sensitive HR/admin data
 */

import { AttendanceRecord, Employee, LeaveRequest } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import { getLocalDateString } from '../../utils/dateUtils.js';
import logger from '../../utils/logger.js';

/**
 * Wrapper for consistent API responses
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

const companyStatusController = {
  /**
   * Get employees on leave today (company-wide, employee-safe)
   * ✅ Shows: Name, Department, Leave Type, Duration
   * ❌ Hides: Leave balance, approval details, private info
   */
  getTodayLeaveStatus: async (req, res) => {
    try {
      const today = getLocalDateString(new Date());
      
      console.log('🏖️ [COMPANY STATUS] Fetching leave data for date:', today);
      
      // Get approved leave requests for today
      const leaveRequests = await LeaveRequest.findAll({
        where: {
          status: 'approved',
          [Op.and]: [
            { startDate: { [Op.lte]: today } },
            { endDate: { [Op.gte]: today } }
          ]
        },
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'department', 'employeeId'],
          where: {
            status: 'active' // Only active employees
          }
        }],
        attributes: ['id', 'leaveType', 'isHalfDay', 'startDate', 'endDate']
      });

      console.log('🏖️ [COMPANY STATUS] Found leave requests:', leaveRequests.length);

      // Transform to employee-safe format
      const leaveData = leaveRequests.map(leave => ({
        id: leave.id,
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`.trim(),
        employeeCode: leave.employee.employeeId,
        department: leave.employee.department || 'Unknown',
        leaveType: leave.leaveType,
        duration: leave.isHalfDay ? 'Half Day' : 'Full Day'
      }));

      return sendResponse(res, true, 'Leave status retrieved successfully', leaveData);
    } catch (error) {
      console.error('🏖️ [COMPANY STATUS] Leave Error:', error);
      logger.error('Controller: Get Today Leave Status Error', error);
      return sendResponse(res, false, 'Failed to load leave status', [], 500);
    }
  },

  /**
   * Get employees working from home today (company-wide, employee-safe)
   * ✅ Shows: Name, Department, Work Mode
   * ❌ Hides: Clock times, location details, private info
   */
  getTodayWFHStatus: async (req, res) => {
    try {
      const today = getLocalDateString(new Date());
      
      console.log('🏠 [COMPANY STATUS] Fetching WFH data for date:', today);
      
      // Get attendance records for today where workMode is 'wfh'
      const wfhRecords = await AttendanceRecord.findAll({
        where: {
          date: today,
          clockIn: { [Op.ne]: null }, // Must be clocked in
          workMode: 'wfh' // ✅ FIX: Use workMode field directly
        },
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'department', 'employeeId'],
          where: {
            status: 'active' // Only active employees
          }
        }],
        attributes: ['id', 'workMode', 'location'] // Include workMode field
      });

      console.log('🏠 [COMPANY STATUS] Found WFH records:', wfhRecords.length);

      // Transform to employee-safe format
      const wfhData = wfhRecords.map(record => ({
        id: record.employee.employeeId,
        employeeName: `${record.employee.firstName} ${record.employee.lastName}`.trim(),
        employeeCode: record.employee.employeeId,
        department: record.employee.department || 'Unknown',
        status: 'WFH',
        workMode: 'Remote'
      }));

      return sendResponse(res, true, 'WFH status retrieved successfully', wfhData);
    } catch (error) {
      console.error('🏠 [COMPANY STATUS] WFH Error:', error);
      logger.error('Controller: Get Today WFH Status Error', error);
      return sendResponse(res, false, 'Failed to load WFH status', [], 500);
    }
  },

  /**
   * Get general company status today (combined view)
   * ✅ Shows: High-level status overview
   * ❌ Hides: Detailed attendance data
   */
  getTodayCompanyStatus: async (req, res) => {
    try {
      const today = getLocalDateString(new Date());
      
      // Get basic attendance records for today
      const attendanceRecords = await AttendanceRecord.findAll({
        where: {
          date: today
        },
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'department', 'employeeId'],
          where: {
            status: 'active'
          }
        }],
        attributes: ['id', 'status', 'workMode', 'clockIn'] // ✅ FIX: Use workMode field
      });

      // Transform to employee-safe format
      const statusData = attendanceRecords.map(record => {
        return {
          employeeName: `${record.employee.firstName} ${record.employee.lastName}`.trim(),
          employeeCode: record.employee.employeeId,
          department: record.employee.department || 'Unknown',
          status: record.status === 'present' ? 'Working' : 
                  record.status === 'leave' ? 'On Leave' :
                  record.status === 'half_day' ? 'Half Day' :
                  record.clockIn ? 'Working' : 'Not Started',
          workMode: record.workMode === 'wfh' ? 'WFH' : 
                   record.workMode === 'hybrid' ? 'Hybrid' :
                   record.workMode === 'field' ? 'Field' : 'Office'
        };
      });

      return sendResponse(res, true, 'Company status retrieved successfully', statusData);
    } catch (error) {
      logger.error('Controller: Get Today Company Status Error', error);
      return sendResponse(res, false, 'Failed to load company status', [], 500);
    }
  },

  /**
   * DEBUG: Get raw attendance data to understand structure
   * This is a temporary endpoint for debugging
   */
  getDebugAttendanceData: async (req, res) => {
    try {
      const today = getLocalDateString(new Date());
      
      const records = await AttendanceRecord.findAll({
        where: {
          date: today,
          clockIn: { [Op.ne]: null }
        },
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['firstName', 'lastName', 'employeeId']
        }],
        attributes: ['id', 'workMode', 'location', 'clockIn'], // ✅ FIX: Include workMode field
        limit: 5 // Just get a few records for debugging
      });

      const debugData = records.map(record => ({
        id: record.id,
        employee: record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'No employee',
        workMode: record.workMode, // ✅ FIX: Show workMode field
        location: record.location,
        locationType: typeof record.location,
        hasClockIn: !!record.clockIn
      }));

      return sendResponse(res, true, 'Debug data retrieved', debugData);
    } catch (error) {
      console.error('Debug endpoint error:', error);
      return sendResponse(res, false, 'Debug failed', [], 500);
    }
  }
};

export default companyStatusController;