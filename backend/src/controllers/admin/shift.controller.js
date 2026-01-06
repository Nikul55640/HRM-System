import shiftService from '../../services/admin/shift.service.js';
import notificationService from '../../services/notificationService.js';

const ShiftController = {
  // Get all shifts
  async getShifts(req, res) {
    try {
      const result = await shiftService.getShifts(req.query, req.query);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shifts'
      });
    }
  },

  // Get single shift
  async getShift(req, res) {
    try {
      const { id } = req.params;
      const result = await shiftService.getShiftById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shift'
      });
    }
  },

  // Create new shift
  async createShift(req, res) {
    try {
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await shiftService.createShift(req.body, req.user.id, metadata);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create shift'
      });
    }
  },

  // Update shift
  async updateShift(req, res) {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await shiftService.updateShift(id, req.body, req.user.id, metadata);

      if (!result.success) {
        return res.status(result.message === 'Shift not found' ? 404 : 400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error updating shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update shift'
      });
    }
  },

  // Delete shift (soft delete)
  async deleteShift(req, res) {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await shiftService.deleteShift(id, req.user.id, metadata);

      if (!result.success) {
        return res.status(result.message === 'Shift not found' ? 404 : 400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error deleting shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete shift'
      });
    }
  },

  // Set default shift
  async setDefaultShift(req, res) {
    try {
      const { id } = req.params;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await shiftService.setDefaultShift(id, req.user.id, metadata);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error setting default shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set default shift'
      });
    }
  },

  // Get shift statistics
  async getShiftStats(req, res) {
    try {
      const result = await shiftService.getShiftStats();

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching shift stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shift statistics'
      });
    }
  },

  // Assign employees to shift
  async assignEmployeesToShift(req, res) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await shiftService.assignEmployeesToShift(id, employeeIds, req.user.id, metadata);

      if (!result.success) {
        return res.status(result.message === 'Shift not found' ? 404 : 400).json(result);
      }

      // 🔔 Send notifications to assigned employees
      try {
        if (result.data && result.data.assignments) {
          for (const assignment of result.data.assignments) {
            if (assignment.employee && assignment.employee.userId && assignment.shift) {
              await notificationService.sendToUser(assignment.employee.userId, {
                title: 'New Shift Assignment 🕐',
                message: `You have been assigned to the "${assignment.shift.name}" shift (${assignment.shift.shiftStartTime} - ${assignment.shift.shiftEndTime})`,
                type: 'info',
                category: 'shift',
                metadata: {
                  shiftId: assignment.shift.id,
                  shiftName: assignment.shift.name,
                  shiftStartTime: assignment.shift.shiftStartTime,
                  shiftEndTime: assignment.shift.shiftEndTime,
                  effectiveDate: assignment.effectiveDate,
                  assignedBy: req.user.firstName + ' ' + req.user.lastName
                }
              });
            }
          }
        }
      } catch (notificationError) {
        console.error("Failed to send shift assignment notifications:", notificationError);
        // Don't fail the main operation if notification fails
      }

      res.json(result);
    } catch (error) {
      console.error('Error assigning employees to shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign employees to shift'
      });
    }
  },

  // Remove employees from shift
  async removeEmployeesFromShift(req, res) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await shiftService.removeEmployeesFromShift(id, employeeIds, req.user.id, metadata);

      if (!result.success) {
        return res.status(result.message === 'Shift not found' ? 404 : 400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error removing employees from shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove employees from shift'
      });
    }
  }
};

export default ShiftController;