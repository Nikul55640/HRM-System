import { LeaveType, User } from '../../models/sequelize/index.js';
import { Op } from 'sequelize';
import logger from '../../utils/logger.js';

// Get all leave types
export const getLeaveTypes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows } = await LeaveType.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        leaveTypes: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching leave types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave types',
      error: error.message
    });
  }
};

// Get leave type by ID
export const getLeaveTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveType = await LeaveType.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }

    res.json({
      success: true,
      data: leaveType
    });
  } catch (error) {
    logger.error('Error fetching leave type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave type',
      error: error.message
    });
  }
};

// Create new leave type
export const createLeaveType = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      maxDaysPerYear,
      maxConsecutiveDays,
      carryForward,
      carryForwardLimit,
      isPaid,
      requiresApproval,
      advanceNoticeRequired,
      applicableGender,
      minServiceMonths,
      color
    } = req.body;

    // Check if leave type with same name or code exists
    const existingLeaveType = await LeaveType.findOne({
      where: {
        [Op.or]: [
          { name: name },
          { code: code }
        ]
      }
    });

    if (existingLeaveType) {
      return res.status(400).json({
        success: false,
        message: 'Leave type with this name or code already exists'
      });
    }

    const leaveType = await LeaveType.create({
      name,
      code: code.toUpperCase(),
      description,
      maxDaysPerYear,
      maxConsecutiveDays,
      carryForward,
      carryForwardLimit,
      isPaid,
      requiresApproval,
      advanceNoticeRequired,
      applicableGender,
      minServiceMonths,
      color,
      createdBy: req.user.id
    });

    const createdLeaveType = await LeaveType.findByPk(leaveType.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      data: createdLeaveType
    });
  } catch (error) {
    logger.error('Error creating leave type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave type',
      error: error.message
    });
  }
};

// Update leave type
export const updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      maxDaysPerYear,
      maxConsecutiveDays,
      carryForward,
      carryForwardLimit,
      isPaid,
      requiresApproval,
      advanceNoticeRequired,
      applicableGender,
      minServiceMonths,
      isActive,
      color
    } = req.body;

    const leaveType = await LeaveType.findByPk(id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }

    // Check if another leave type with same name or code exists
    const existingLeaveType = await LeaveType.findOne({
      where: {
        id: { [Op.ne]: id },
        [Op.or]: [
          { name: name },
          { code: code }
        ]
      }
    });

    if (existingLeaveType) {
      return res.status(400).json({
        success: false,
        message: 'Another leave type with this name or code already exists'
      });
    }

    await leaveType.update({
      name,
      code: code.toUpperCase(),
      description,
      maxDaysPerYear,
      maxConsecutiveDays,
      carryForward,
      carryForwardLimit,
      isPaid,
      requiresApproval,
      advanceNoticeRequired,
      applicableGender,
      minServiceMonths,
      isActive,
      color,
      updatedBy: req.user.id
    });

    const updatedLeaveType = await LeaveType.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Leave type updated successfully',
      data: updatedLeaveType
    });
  } catch (error) {
    logger.error('Error updating leave type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave type',
      error: error.message
    });
  }
};

// Delete leave type
export const deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveType = await LeaveType.findByPk(id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }

    // Check if leave type is being used in any leave requests
    const { LeaveRequest } = await import('../../models/sequelize/index.js');
    const leaveRequestCount = await LeaveRequest.count({
      where: { leaveTypeId: id }
    });

    if (leaveRequestCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete leave type as it is being used in leave requests. You can deactivate it instead.'
      });
    }

    await leaveType.destroy();

    res.json({
      success: true,
      message: 'Leave type deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting leave type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave type',
      error: error.message
    });
  }
};

// Toggle leave type status
export const toggleLeaveTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveType = await LeaveType.findByPk(id);

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Leave type not found'
      });
    }

    await leaveType.update({
      isActive: !leaveType.isActive,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: `Leave type ${leaveType.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: leaveType.isActive }
    });
  } catch (error) {
    logger.error('Error toggling leave type status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle leave type status',
      error: error.message
    });
  }
};

// Get active leave types for dropdown
export const getActiveLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await LeaveType.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code', 'color', 'maxDaysPerYear', 'requiresApproval'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: leaveTypes
    });
  } catch (error) {
    logger.error('Error fetching active leave types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active leave types',
      error: error.message
    });
  }
};