import { EmployeeShift, Employee, Shift, User } from '../../models/index.js';
import { Op } from 'sequelize';
import auditService from '../../services/audit/audit.service.js';

const EmployeeShiftController = {
  // Get employee shift assignments
  async getEmployeeShifts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        employeeId,
        shiftId,
        isActive,
        effectiveDate,
        sortBy = 'effectiveDate',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (employeeId) whereClause.employeeId = employeeId;
      if (shiftId) whereClause.shiftId = shiftId;
      if (isActive !== undefined) whereClause.isActive = isActive === 'true';
      if (effectiveDate) {
        whereClause.effectiveDate = {
          [Op.lte]: effectiveDate
        };
        whereClause[Op.or] = [
          { endDate: null },
          { endDate: { [Op.gte]: effectiveDate } }
        ];
      }

      const assignments = await EmployeeShift.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email', 'designation', 'department']
          },
          {
            model: Shift,
            as: 'shift',
            attributes: ['id', 'shiftName', 'shiftCode', 'shiftStartTime', 'shiftEndTime']
          },
          {
            model: User,
            as: 'assignedByUser',
            attributes: ['id', 'email']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset
      });

      res.json({
        success: true,
        data: assignments.rows,
        pagination: {
          total: assignments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(assignments.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching employee shifts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employee shift assignments'
      });
    }
  },

  // Get current shift for employee
  async getCurrentEmployeeShift(req, res) {
    try {
      const { employeeId } = req.params;
      const { date = new Date().toISOString().split('T')[0] } = req.query;

      const currentShift = await EmployeeShift.findOne({
        where: {
          employeeId,
          isActive: true,
          effectiveDate: { [Op.lte]: date },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: date } }
          ]
        },
        include: [
          {
            model: Shift,
            as: 'shift'
          }
        ],
        order: [['effectiveDate', 'DESC']]
      });

      if (!currentShift) {
        // Try to get default shift
        const defaultShift = await Shift.findOne({
          where: { isDefault: true, isActive: true }
        });

        if (defaultShift) {
          return res.json({
            success: true,
            data: {
              shift: defaultShift,
              isDefault: true,
              message: 'Using default shift (no specific assignment found)'
            }
          });
        }

        return res.status(404).json({
          success: false,
          message: 'No shift assignment found for this employee'
        });
      }

      res.json({
        success: true,
        data: {
          assignment: currentShift,
          shift: currentShift.shift,
          isDefault: false
        }
      });
    } catch (error) {
      console.error('Error fetching current employee shift:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current employee shift'
      });
    }
  },

  // Assign shift to employee
  async assignShift(req, res) {
    try {
      const {
        employeeId,
        shiftId,
        effectiveDate,
        endDate,
        notes
      } = req.body;

      // Validate employee exists
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Validate shift exists
      const shift = await Shift.findByPk(shiftId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          message: 'Shift not found'
        });
      }

      // End any existing active assignments for this employee from the effective date
      await EmployeeShift.update(
        { 
          endDate: new Date(new Date(effectiveDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: false
        },
        {
          where: {
            employeeId,
            isActive: true,
            effectiveDate: { [Op.lt]: effectiveDate }
          }
        }
      );

      // Create new assignment
      const assignment = await EmployeeShift.create({
        employeeId,
        shiftId,
        effectiveDate,
        endDate,
        notes,
        assignedBy: req.user.id
      });

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'EMPLOYEE_SHIFT_ASSIGNED',
        resource: 'EmployeeShift',
        resourceId: assignment.id,
        details: {
          employeeId,
          shiftId,
          shiftName: shift.shiftName,
          effectiveDate,
          endDate
        }
      });

      const createdAssignment = await EmployeeShift.findByPk(assignment.id, {
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email', 'designation', 'department']
          },
          {
            model: Shift,
            as: 'shift'
          },
          {
            model: User,
            as: 'assignedByUser',
            attributes: ['id', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Shift assigned successfully',
        data: createdAssignment
      });
    } catch (error) {
      console.error('Error assigning shift:', error);
      
      if (error.message.includes('overlapping') || error.message.includes('already has a shift')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to assign shift'
      });
    }
  },

  // Update shift assignment
  async updateShiftAssignment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const assignment = await EmployeeShift.findByPk(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Shift assignment not found'
        });
      }

      await assignment.update(updateData);

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'EMPLOYEE_SHIFT_UPDATED',
        resource: 'EmployeeShift',
        resourceId: assignment.id,
        details: {
          changes: updateData
        }
      });

      const updatedAssignment = await EmployeeShift.findByPk(id, {
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email', 'designation', 'department']
          },
          {
            model: Shift,
            as: 'shift'
          },
          {
            model: User,
            as: 'assignedByUser',
            attributes: ['id', 'email']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Shift assignment updated successfully',
        data: updatedAssignment
      });
    } catch (error) {
      console.error('Error updating shift assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update shift assignment'
      });
    }
  },

  // End shift assignment
  async endShiftAssignment(req, res) {
    try {
      const { id } = req.params;
      const { endDate = new Date().toISOString().split('T')[0] } = req.body;

      const assignment = await EmployeeShift.findByPk(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Shift assignment not found'
        });
      }

      await assignment.update({
        endDate,
        isActive: false
      });

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'EMPLOYEE_SHIFT_ENDED',
        resource: 'EmployeeShift',
        resourceId: assignment.id,
        details: {
          endDate
        }
      });

      res.json({
        success: true,
        message: 'Shift assignment ended successfully'
      });
    } catch (error) {
      console.error('Error ending shift assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end shift assignment'
      });
    }
  },

  // Bulk assign shifts
  async bulkAssignShifts(req, res) {
    try {
      const { assignments } = req.body; // Array of { employeeId, shiftId, effectiveDate, endDate, notes }

      const results = [];
      const errors = [];

      for (const assignmentData of assignments) {
        try {
          // Validate employee and shift
          const [employee, shift] = await Promise.all([
            Employee.findByPk(assignmentData.employeeId),
            Shift.findByPk(assignmentData.shiftId)
          ]);

          if (!employee) {
            errors.push({
              employeeId: assignmentData.employeeId,
              error: 'Employee not found'
            });
            continue;
          }

          if (!shift) {
            errors.push({
              employeeId: assignmentData.employeeId,
              error: 'Shift not found'
            });
            continue;
          }

          // End existing assignments
          await EmployeeShift.update(
            { 
              endDate: new Date(new Date(assignmentData.effectiveDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              isActive: false
            },
            {
              where: {
                employeeId: assignmentData.employeeId,
                isActive: true,
                effectiveDate: { [Op.lt]: assignmentData.effectiveDate }
              }
            }
          );

          // Create new assignment
          const assignment = await EmployeeShift.create({
            ...assignmentData,
            assignedBy: req.user.id
          });

          results.push({
            employeeId: assignmentData.employeeId,
            assignmentId: assignment.id,
            success: true
          });

        } catch (error) {
          errors.push({
            employeeId: assignmentData.employeeId,
            error: error.message
          });
        }
      }

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'BULK_SHIFT_ASSIGNMENT',
        resource: 'EmployeeShift',
        details: {
          totalAssignments: assignments.length,
          successful: results.length,
          failed: errors.length
        }
      });

      res.json({
        success: true,
        message: `Bulk assignment completed. ${results.length} successful, ${errors.length} failed.`,
        data: {
          successful: results,
          failed: errors
        }
      });
    } catch (error) {
      console.error('Error in bulk shift assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk shift assignments'
      });
    }
  }
};

export default EmployeeShiftController;