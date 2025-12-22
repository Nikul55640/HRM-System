/**
 * Admin Attendance Routes
 * Routes for admin/HR attendance management
 */

import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { checkPermission, checkAnyPermission } from '../../middleware/checkPermission.js';
import { MODULES } from '../../config/rolePermissions.js';
import liveAttendanceController from '../../controllers/admin/liveAttendance.controller.js';
import attendanceController from '../../controllers/employee/attendance.controller.js';
import { AttendanceRecord } from '../../models/sequelize/index.js';
import {
  preventHistoricalModification,
  checkConsistencyBeforeSave,
  validateTimestamps,
} from '../../middleware/attendanceValidation.js';

const router = express.Router();

/* ============================================================
   ADMIN/HR ATTENDANCE ROUTES
   ============================================================ */

// Get live attendance (currently active sessions)
router.get(
  '/live',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  liveAttendanceController.getLiveAttendance
);

// Get live status for specific employee
router.get(
  '/live/:employeeId',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  liveAttendanceController.getEmployeeLiveStatus
);

// Manual update attendance (HR/Admin only)
router.put(
  '/:recordId',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.EDIT_ANY),
  preventHistoricalModification,
  validateTimestamps,
  checkConsistencyBeforeSave,
  attendanceController.manualUpdateAttendance
);

// Get all employees attendance (admin view)
router.get(
  '/all',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_ALL),
  attendanceController.getAllAttendanceRecords
);

// DEBUG: Simple test endpoint to check database
router.get(
  '/debug',
  authenticate,
  checkPermission(MODULES.ATTENDANCE.VIEW_ALL),
  async (req, res) => {
    try {
      console.log('🧪 [DEBUG ENDPOINT] Testing database connection...');
      
      const totalRecords = await AttendanceRecord.count();
      console.log('🧪 [DEBUG ENDPOINT] Total attendance records:', totalRecords);
      
      const recentRecords = await AttendanceRecord.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{
          model: AttendanceRecord.sequelize.models.Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'personalInfo'],
        }],
      });
      
      console.log('🧪 [DEBUG ENDPOINT] Recent records:', recentRecords.length);
      
      const debugData = recentRecords.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        employeeName: record.employee ? 
          `${record.employee.personalInfo?.firstName || ''} ${record.employee.personalInfo?.lastName || ''}`.trim() : 
          'Unknown'
      }));
      
      res.json({
        success: true,
        totalRecords,
        recentRecords: debugData,
        message: 'Debug endpoint working'
      });
      
    } catch (error) {
      console.error('🧪 [DEBUG ENDPOINT] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Simple test endpoint without any complex logic
router.get(
  '/test',
  authenticate,
  async (req, res) => {
    try {
      console.log('🧪 [TEST ENDPOINT] Simple test...');
      
      const records = await AttendanceRecord.findAll({
        where: {
          date: '2025-12-22'
        },
        include: [{
          model: AttendanceRecord.sequelize.models.Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'personalInfo'],
          required: false
        }],
        limit: 10
      });
      
      console.log('🧪 [TEST ENDPOINT] Found records:', records.length);
      
      const formattedRecords = records.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        employeeName: record.employee ? 
          `${record.employee.personalInfo?.firstName || ''} ${record.employee.personalInfo?.lastName || ''}`.trim() : 
          'Unknown'
      }));
      
      res.json({
        success: true,
        data: formattedRecords,
        pagination: {
          current: 1,
          total: 1,
          count: formattedRecords.length,
          totalRecords: records.length,
        },
      });
      
    } catch (error) {
      console.error('🧪 [TEST ENDPOINT] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Force bypass all filters endpoint
router.get(
  '/force-all',
  authenticate,
  async (req, res) => {
    try {
      console.log('🔥 [FORCE ALL] Getting all records without any filters...');
      
      const records = await AttendanceRecord.findAll({
        include: [{
          model: AttendanceRecord.sequelize.models.Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'personalInfo'],
          required: false
        }],
        limit: 10,
        order: [['createdAt', 'DESC']]
      });
      
      console.log('🔥 [FORCE ALL] Found records:', records.length);
      
      const formattedRecords = records.map(record => ({
        id: record.id,
        employeeId: record.employeeId,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        employeeName: record.employee ? 
          `${record.employee.personalInfo?.firstName || ''} ${record.employee.personalInfo?.lastName || ''}`.trim() : 
          'Unknown'
      }));
      
      res.json({
        success: true,
        data: formattedRecords,
        pagination: {
          current: 1,
          total: 1,
          count: formattedRecords.length,
          totalRecords: records.length,
        },
      });
      
    } catch (error) {
      console.error('🔥 [FORCE ALL] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Export attendance reports
router.get(
  '/export',
  authenticate,
  checkAnyPermission([
    MODULES.ATTENDANCE.VIEW_ALL,
    MODULES.ATTENDANCE.VIEW_TEAM,
  ]),
  attendanceController.exportAttendanceReport
);

export default router;