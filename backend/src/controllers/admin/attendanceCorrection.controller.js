import { AttendanceRecord, Employee, AuditLog } from '../../models/index.js';
import auditService from '../../services/audit/audit.service.js';
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
          as: 'employeeInfo',
          attributes: ['id', 'employeeId']
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
          as: 'employeeInfo',
          attributes: ['id', 'employeeId']
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
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        breakTime: record.breakTime,
        workHours: record.workHours,
        workedMinutes: record.workedMinutes
      };

      // Calculate new work hours
      const newCheckIn = checkIn ? new Date(checkIn) : record.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : record.checkOut;
      let newWorkHours = 0;
      let newWorkedMinutes = 0;

      if (newCheckIn && newCheckOut) {
        const timeDiff = newCheckOut - newCheckIn;
        const totalMinutes = timeDiff / (1000 * 60);
        newWorkedMinutes = Math.max(0, totalMinutes - (breakTime || record.breakTime || 0));
        newWorkHours = Math.round((newWorkedMinutes / 60) * 100) / 100;
      }

      // Update the record
      await record.update({
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        breakTime: breakTime !== undefined ? breakTime : record.breakTime,
        workHours: newWorkHours,
        workedMinutes: newWorkedMinutes,
        status: 'present', // Reset to present after correction
        correctionReason: reason,
        correctionType,
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
            checkIn: newCheckIn,
            checkOut: newCheckOut,
            breakTime: breakTime !== undefined ? breakTime : record.breakTime,
            workHours: newWorkHours,
            workedMinutes: newWorkedMinutes
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
            as: 'employeeInfo',
            attributes: ['id', 'employeeId']
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