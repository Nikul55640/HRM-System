import { AttendanceRecord, Employee, AuditLog, AttendanceCorrectionRequest, User } from '../../models/index.js';
import auditService from '../../services/audit/audit.service.js';
import notificationService from '../../services/notificationService.js';
import { Op } from 'sequelize';

class AttendanceCorrectionController {
  // Get attendance records that need correction
  async getPendingCorrections(req, res) {
    try {
      const { page = 1, limit = 20, employeeId, dateFrom, dateTo } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        status: 'pending_correction'
      };

      if (employeeId) {
        whereClause.employeeId = employeeId;
      }

      if (dateFrom && dateTo) {
        whereClause.date = {
          [Op.between]: [new Date(dateFrom), new Date(dateTo)]
        };
      }

      const corrections = await AttendanceRecord.findAndCountAll({
        where: whereClause,
        include: [{
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'firstName', 'lastName']
        }],
        order: [['date', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: corrections.rows,
        pagination: {
          total: corrections.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(corrections.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching pending corrections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending corrections'
      });
    }
  }

  // Apply manual correction to attendance record
  async applyCorrection(req, res) {
    try {
      const { recordId } = req.params;
      const {
        checkIn,
        checkOut,
        breakTime,
        reason,
        correctionType
      } = req.body;

      const record = await AttendanceRecord.findByPk(recordId, {
        include: [{ 
          model: Employee,
          as: 'employee',
          attributes: ['id', 'employeeId', 'firstName', 'lastName']
        }]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      // Store original values for audit
      const originalData = {
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        totalBreakMinutes: record.totalBreakMinutes,
        workHours: record.workHours,
        totalWorkedMinutes: record.totalWorkedMinutes
      };

      // Calculate new work hours
      const newClockIn = checkIn ? new Date(checkIn) : record.clockIn;
      const newClockOut = checkOut ? new Date(checkOut) : record.clockOut;
      const newBreakTime = breakTime !== undefined ? parseInt(breakTime) : record.totalBreakMinutes;
      let newWorkHours = 0;
      let newWorkedMinutes = 0;

      if (newClockIn && newClockOut) {
        const timeDiff = newClockOut - newClockIn;
        const totalMinutes = timeDiff / (1000 * 60);
        newWorkedMinutes = Math.max(0, totalMinutes - (newBreakTime || 0));
        newWorkHours = Math.round((newWorkedMinutes / 60) * 100) / 100;
      }

      // Update the record
      await record.update({
        clockIn: newClockIn,
        clockOut: newClockOut,
        totalBreakMinutes: newBreakTime,
        workHours: newWorkHours,
        totalWorkedMinutes: newWorkedMinutes,
        status: 'present', // Reset to present after correction
        correctionReason: reason,
        correctionStatus: 'approved',
        correctedBy: req.user.id,
        correctedAt: new Date()
      });

      // Create audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'ATTENDANCE_CORRECTION',
        resource: 'AttendanceRecord',
        resourceId: recordId,
        details: {
          employeeId: record.employeeId,
          date: record.date,
          originalData,
          newData: {
            clockIn: newClockIn,
            clockOut: newClockOut,
            totalBreakMinutes: newBreakTime,
            workHours: newWorkHours,
            totalWorkedMinutes: newWorkedMinutes
          },
          reason,
          correctionType
        }
      });

      res.json({
        success: true,
        message: 'Attendance correction applied successfully',
        data: record
      });
    } catch (error) {
      console.error('Error applying attendance correction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply attendance correction'
      });
    }
  }

  // Get correction history
  async getCorrectionHistory(req, res) {
    try {
      const { page = 1, limit = 20, employeeId, dateFrom, dateTo } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {
        correctedAt: { [Op.not]: null }
      };

      if (employeeId) {
        whereClause.employeeId = employeeId;
      }

      if (dateFrom && dateTo) {
        whereClause.correctedAt = {
          [Op.between]: [new Date(dateFrom), new Date(dateTo)]
        };
      }

      const history = await AttendanceRecord.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
          }
        ],
        order: [['correctedAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: history.rows,
        pagination: {
          total: history.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(history.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching correction history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch correction history'
      });
    }
  }

  // Flag attendance for correction
  async flagForCorrection(req, res) {
    try {
      const { recordId } = req.params;
      const { reason } = req.body;

      const record = await AttendanceRecord.findByPk(recordId);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      await record.update({
        status: 'pending_correction',
        flaggedReason: reason,
        flaggedBy: req.user.id,
        flaggedAt: new Date()
      });

      // Create audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'ATTENDANCE_FLAGGED',
        resource: 'AttendanceRecord',
        resourceId: recordId,
        details: {
          employeeId: record.employeeId,
          date: record.date,
          reason
        }
      });

      res.json({
        success: true,
        message: 'Attendance flagged for correction'
      });
    } catch (error) {
      console.error('Error flagging attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to flag attendance for correction'
      });
    }
  }

  // Get employee correction requests (pending and processed)
  async getEmployeeCorrectionRequests(req, res) {
    try {
      console.log('🔍 [DEBUG] getEmployeeCorrectionRequests called with query:', req.query);
      
      const { page = 1, limit = 20, employeeId, dateFrom, dateTo, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (employeeId) {
        whereClause.employeeId = employeeId;
      }

      if (status) {
        whereClause.status = status;
      }

      if (dateFrom && dateTo) {
        whereClause.date = {
          [Op.between]: [new Date(dateFrom), new Date(dateTo)]
        };
      }

      console.log('🔍 [DEBUG] Where clause:', whereClause);

      const requests = await AttendanceCorrectionRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
          },
          {
            model: User,
            as: 'processor',
            attributes: ['id', 'email'],
            required: false,
            include: [
              {
                model: Employee,
                as: 'employee',
                attributes: ['firstName', 'lastName'],
                required: false
              }
            ]
          },
          {
            model: AttendanceRecord,
            as: 'attendanceRecord',
            attributes: ['id', 'date', 'clockIn', 'clockOut', 'totalBreakMinutes', 'workHours'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      console.log('🔍 [DEBUG] Found requests:', requests.count);

      res.json({
        success: true,
        data: requests.rows,
        pagination: {
          total: requests.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(requests.count / limit)
        }
      });
    } catch (error) {
      console.error('❌ [ERROR] Error fetching employee correction requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee correction requests'
      });
    }
  }

  // Approve employee correction request
  async approveEmployeeCorrectionRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { adminNotes } = req.body;

      console.log('🔍 [DEBUG] Approving correction request:', { requestId, adminNotes });

      const request = await AttendanceCorrectionRequest.findByPk(requestId, {
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
          }
        ]
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Correction request not found'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Request has already been processed'
        });
      }

      console.log('🔍 [DEBUG] Request details:', {
        id: request.id,
        employeeId: request.employeeId,
        date: request.date,
        attendanceRecordId: request.attendanceRecordId,
        requestedClockIn: request.requestedClockIn,
        requestedClockOut: request.requestedClockOut,
        requestedBreakMinutes: request.requestedBreakMinutes
      });

      // Update the request
      await request.update({
        status: 'approved',
        processedBy: req.user.id,
        processedAt: new Date(),
        adminNotes: adminNotes || null
      });

      // Find or create attendance record for the correction
      let attendanceRecord = null;
      
      if (request.attendanceRecordId) {
        // If there's an associated attendance record, use it
        attendanceRecord = await AttendanceRecord.findByPk(request.attendanceRecordId);
      } else {
        // If no attendance record is linked, find one for the date or create a new one
        attendanceRecord = await AttendanceRecord.findOne({
          where: {
            employeeId: request.employeeId,
            date: request.date
          }
        });
        
        if (!attendanceRecord) {
          // Create a new attendance record if none exists
          attendanceRecord = await AttendanceRecord.create({
            employeeId: request.employeeId,
            date: request.date,
            clockIn: null,
            clockOut: null,
            totalBreakMinutes: 0,
            totalWorkedMinutes: 0,
            workHours: 0,
            status: 'pending_correction',
            createdBy: req.user.id
          });
        }
        
        // Link the correction request to the attendance record
        await request.update({ attendanceRecordId: attendanceRecord.id });
      }

      if (attendanceRecord) {
        const updateData = {};
        
        if (request.requestedClockIn) {
          updateData.clockIn = new Date(request.requestedClockIn);
        }
        
        if (request.requestedClockOut) {
          updateData.clockOut = new Date(request.requestedClockOut);
        }
        
        if (request.requestedBreakMinutes !== null) {
          updateData.totalBreakMinutes = request.requestedBreakMinutes;
        }

        // Recalculate work hours if both clock in and out are available
        const clockIn = updateData.clockIn || attendanceRecord.clockIn;
        const clockOut = updateData.clockOut || attendanceRecord.clockOut;
        const breakMinutes = updateData.totalBreakMinutes !== undefined ? updateData.totalBreakMinutes : attendanceRecord.totalBreakMinutes;
        
        if (clockIn && clockOut) {
          const timeDiff = clockOut - clockIn;
          const totalMinutes = timeDiff / (1000 * 60);
          const workedMinutes = Math.max(0, totalMinutes - (breakMinutes || 0));
          updateData.workHours = Math.round((workedMinutes / 60) * 100) / 100;
          updateData.totalWorkedMinutes = workedMinutes;
        }

        updateData.correctionReason = request.reason;
        updateData.correctedBy = req.user.id;
        updateData.correctedAt = new Date();
        updateData.status = 'present';

        await attendanceRecord.update(updateData);
        
        console.log('✅ [DEBUG] Attendance record updated:', {
          recordId: attendanceRecord.id,
          employeeId: request.employeeId,
          date: request.date,
          clockIn: updateData.clockIn,
          clockOut: updateData.clockOut,
          workHours: updateData.workHours
        });
      }

      // Create audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'CORRECTION_REQUEST_APPROVED',
        resource: 'AttendanceCorrectionRequest',
        resourceId: requestId,
        details: {
          employeeId: request.employeeId,
          date: request.date,
          adminNotes
        }
      });

      // 🔔 Send notification to employee about approval
      try {
        if (request.employee && request.employee.userId) {
          await notificationService.sendToUser(request.employee.userId, {
            title: 'Attendance Correction Approved ✅',
            message: `Your attendance correction request for ${new Date(request.date).toLocaleDateString()} has been approved.`,
            type: 'success',
            category: 'attendance',
            metadata: {
              correctionRequestId: request.id,
              date: request.date,
              approvedBy: req.user.firstName + ' ' + req.user.lastName,
              adminNotes: adminNotes
            }
          });
        }
      } catch (notificationError) {
        console.error("Failed to send correction approval notification:", notificationError);
        // Don't fail the main operation if notification fails
      }

      res.json({
        success: true,
        message: 'Correction request approved successfully',
        data: request
      });
    } catch (error) {
      console.error('Error approving correction request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve correction request'
      });
    }
  }

  // Reject employee correction request
  async rejectEmployeeCorrectionRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { adminNotes } = req.body;

      const request = await AttendanceCorrectionRequest.findByPk(requestId, {
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
          }
        ]
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Correction request not found'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Request has already been processed'
        });
      }

      // Update the request
      await request.update({
        status: 'rejected',
        processedBy: req.user.id,
        processedAt: new Date(),
        adminNotes: adminNotes || null
      });

      // Create audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'CORRECTION_REQUEST_REJECTED',
        resource: 'AttendanceCorrectionRequest',
        resourceId: requestId,
        details: {
          employeeId: request.employeeId,
          date: request.date,
          adminNotes
        }
      });

      // 🔔 Send notification to employee about rejection
      try {
        if (request.employee && request.employee.userId) {
          await notificationService.sendToUser(request.employee.userId, {
            title: 'Attendance Correction Rejected ❌',
            message: `Your attendance correction request for ${new Date(request.date).toLocaleDateString()} has been rejected.${adminNotes ? ' Reason: ' + adminNotes : ''}`,
            type: 'error',
            category: 'attendance',
            metadata: {
              correctionRequestId: request.id,
              date: request.date,
              rejectedBy: req.user.firstName + ' ' + req.user.lastName,
              adminNotes: adminNotes
            }
          });
        }
      } catch (notificationError) {
        console.error("Failed to send correction rejection notification:", notificationError);
        // Don't fail the main operation if notification fails
      }

      res.json({
        success: true,
        message: 'Correction request rejected',
        data: request
      });
    } catch (error) {
      console.error('Error rejecting correction request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject correction request'
      });
    }
  }

  // Bulk apply corrections
  async bulkCorrection(req, res) {
    try {
      const { corrections, reason } = req.body;

      const results = [];
      
      for (const correction of corrections) {
        try {
          const record = await AttendanceRecord.findByPk(correction.recordId);
          
          if (record) {
            const originalData = {
              checkIn: record.checkIn,
              checkOut: record.checkOut,
              breakTime: record.breakTime,
              workHours: record.workHours
            };

            // Calculate new work hours
            const newCheckIn = correction.checkIn ? new Date(correction.checkIn) : record.checkIn;
            const newCheckOut = correction.checkOut ? new Date(correction.checkOut) : record.checkOut;
            let newWorkHours = 0;
            let newWorkedMinutes = 0;

            if (newCheckIn && newCheckOut) {
              const timeDiff = newCheckOut - newCheckIn;
              const totalMinutes = timeDiff / (1000 * 60);
              newWorkedMinutes = Math.max(0, totalMinutes - (correction.breakTime || record.breakTime || 0));
              newWorkHours = Math.round((newWorkedMinutes / 60) * 100) / 100;
            }

            await record.update({
              checkIn: newCheckIn,
              checkOut: newCheckOut,
              breakTime: correction.breakTime !== undefined ? correction.breakTime : record.breakTime,
              workHours: newWorkHours,
              workedMinutes: newWorkedMinutes,
              status: 'present',
              correctionReason: reason,
              correctionType: 'bulk',
              correctedBy: req.user.id,
              correctedAt: new Date()
            });

            // Create audit log
            await auditService.logAction({
              userId: req.user.id,
              action: 'BULK_ATTENDANCE_CORRECTION',
              resource: 'AttendanceRecord',
              resourceId: correction.recordId,
              details: {
                employeeId: record.employeeId,
                originalData,
                newData: {
                  checkIn: newCheckIn,
                  checkOut: newCheckOut,
                  breakTime: correction.breakTime !== undefined ? correction.breakTime : record.breakTime,
                  workHours: newWorkHours
                },
                reason
              }
            });

            results.push({
              recordId: correction.recordId,
              success: true
            });
          } else {
            results.push({
              recordId: correction.recordId,
              success: false,
              error: 'Record not found'
            });
          }
        } catch (error) {
          results.push({
            recordId: correction.recordId,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Bulk corrections processed',
        results
      });
    } catch (error) {
      console.error('Error applying bulk corrections:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to apply bulk corrections'
      });
    }
  }
}

export default new AttendanceCorrectionController();