import { Shift, EmployeeShift, Employee, User } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import auditService from '../../services/audit/audit.service.js';

const ShiftController = {
  // Get all shifts
  async getShifts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      if (search) {
        whereClause[Op.or] = [
          { shiftName: { [Op.iLike]: `%${search}%` } },
          { shiftCode: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const shifts = await Shift.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email']
          },
          {
            model: EmployeeShift,
            as: 'employeeAssignments',
            where: { isActive: true },
            required: false,
            include: [
              {
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeId', 'personalInfo']
              }
            ]
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset,
        distinct: true
      });

      // Add employee count to each shift
      const shiftsWithCounts = shifts.rows.map(shift => {
        const shiftData = shift.toJSON();
        shiftData.employeeCount = shift.employeeAssignments ? shift.employeeAssignments.length : 0;
        return shiftData;
      });

      res.json({
        success: true,
        data: shiftsWithCounts,
        pagination: {
          total: shifts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(shifts.count / limit)
        }
      });
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

      const shift = await Shift.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'email']
          },
          {
            model: EmployeeShift,
            as: 'employeeAssignments',
            where: { isActive: true },
            required: false,
            include: [
              {
                model: Employee,
                as: 'employee',
                attributes: ['id', 'employeeId', 'personalInfo']
              }
            ]
          }
        ]
      });

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: 'Shift not found'
        });
      }

      res.json({
        success: true,
        data: shift
      });
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
      const shiftData = {
        ...req.body,
        createdBy: req.user.id
      };

      const shift = await Shift.create(shiftData);

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'SHIFT_CREATED',
        resource: 'Shift',
        resourceId: shift.id,
        details: {
          shiftName: shift.shiftName,
          shiftCode: shift.shiftCode
        }
      });

      const createdShift = await Shift.findByPk(shift.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Shift created successfully',
        data: createdShift
      });
    } catch (error) {
      console.error('Error creating shift:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Shift name or code already exists'
        });
      }

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
      const updateData = {
        ...req.body,
        updatedBy: req.user.id
      };

      const shift = await Shift.findByPk(id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: 'Shift not found'
        });
      }

      await shift.update(updateData);

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'SHIFT_UPDATED',
        resource: 'Shift',
        resourceId: shift.id,
        details: {
          shiftName: shift.shiftName,
          changes: updateData
        }
      });

      const updatedShift = await Shift.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'email']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'email']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Shift updated successfully',
        data: updatedShift
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Shift name or code already exists'
        });
      }

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

      const shift = await Shift.findByPk(id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: 'Shift not found'
        });
      }

      // Check if shift has active employee assignments
      const activeAssignments = await EmployeeShift.count({
        where: {
          shiftId: id,
          isActive: true
        }
      });

      if (activeAssignments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete shift. ${activeAssignments} employees are currently assigned to this shift.`
        });
      }

      await shift.update({ isActive: false });

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'SHIFT_DELETED',
        resource: 'Shift',
        resourceId: shift.id,
        details: {
          shiftName: shift.shiftName
        }
      });

      res.json({
        success: true,
        message: 'Shift deleted successfully'
      });
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

      const shift = await Shift.findByPk(id);

      if (!shift) {
        return res.status(404).json({
          success: false,
          message: 'Shift not found'
        });
      }

      await shift.update({ isDefault: true });

      // Audit log
      await auditService.logAction({
        userId: req.user.id,
        action: 'SHIFT_SET_DEFAULT',
        resource: 'Shift',
        resourceId: shift.id,
        details: {
          shiftName: shift.shiftName
        }
      });

      res.json({
        success: true,
        message: 'Default shift updated successfully'
      });
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
      const [
        totalShifts,
        activeShifts,
        defaultShift,
        totalAssignments,
        shiftDistribution
      ] = await Promise.all([
        Shift.count(),
        Shift.count({ where: { isActive: true } }),
        Shift.findOne({ where: { isDefault: true } }),
        EmployeeShift.count({ where: { isActive: true } }),
        Shift.findAll({
          attributes: [
            'id',
            'shiftName',
            'shiftCode',
            [Shift.sequelize.fn('COUNT', Shift.sequelize.col('employeeAssignments.id')), 'employeeCount']
          ],
          include: [
            {
              model: EmployeeShift,
              as: 'employeeAssignments',
              where: { isActive: true },
              required: false,
              attributes: []
            }
          ],
          where: { isActive: true },
          group: ['Shift.id'],
          raw: true
        })
      ]);

      res.json({
        success: true,
        data: {
          totalShifts,
          activeShifts,
          defaultShift: defaultShift ? {
            id: defaultShift.id,
            name: defaultShift.shiftName,
            code: defaultShift.shiftCode
          } : null,
          totalAssignments,
          shiftDistribution
        }
      });
    } catch (error) {
      console.error('Error fetching shift stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch shift statistics'
      });
    }
  }
};

export default ShiftController;