import { WorkingRule } from '../../models/index.js';
import logger from '../../utils/logger.js';

/**
 * Get all working rules
 */
export const getWorkingRules = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows } = await WorkingRule.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['isDefault', 'DESC'], ['effectiveFrom', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        workingRules: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching working rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch working rules',
      error: error.message
    });
  }
};

/**
 * Get working rule by ID
 */
export const getWorkingRuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const workingRule = await WorkingRule.findByPk(id);

    if (!workingRule) {
      return res.status(404).json({
        success: false,
        message: 'Working rule not found'
      });
    }

    res.json({
      success: true,
      data: workingRule
    });
  } catch (error) {
    logger.error('Error fetching working rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch working rule',
      error: error.message
    });
  }
};

/**
 * Get active working rule
 */
export const getActiveWorkingRule = async (req, res) => {
  try {
    const { date } = req.query;
    const checkDate = date ? new Date(date) : new Date();
    
    const workingRule = await WorkingRule.getActiveRule(checkDate);

    if (!workingRule) {
      return res.status(404).json({
        success: false,
        message: 'No active working rule found'
      });
    }

    res.json({
      success: true,
      data: workingRule
    });
  } catch (error) {
    logger.error('Error fetching active working rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active working rule',
      error: error.message
    });
  }
};

/**
 * Create new working rule
 */
export const createWorkingRule = async (req, res) => {
  try {
    const {
      ruleName,
      workingDays,
      weekendDays,
      effectiveFrom,
      effectiveTo,
      isDefault,
      description
    } = req.body;

    const workingRule = await WorkingRule.create({
      ruleName,
      workingDays,
      weekendDays,
      effectiveFrom,
      effectiveTo,
      isDefault: isDefault || false,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Working rule created successfully',
      data: workingRule
    });
  } catch (error) {
    logger.error('Error creating working rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create working rule',
      error: error.message
    });
  }
};

/**
 * Update working rule
 */
export const updateWorkingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ruleName,
      workingDays,
      weekendDays,
      effectiveFrom,
      effectiveTo,
      isDefault,
      description,
      isActive
    } = req.body;

    const workingRule = await WorkingRule.findByPk(id);

    if (!workingRule) {
      return res.status(404).json({
        success: false,
        message: 'Working rule not found'
      });
    }

    await workingRule.update({
      ruleName,
      workingDays,
      weekendDays,
      effectiveFrom,
      effectiveTo,
      isDefault,
      description,
      isActive,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Working rule updated successfully',
      data: workingRule
    });
  } catch (error) {
    logger.error('Error updating working rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update working rule',
      error: error.message
    });
  }
};

/**
 * Delete working rule
 */
export const deleteWorkingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const workingRule = await WorkingRule.findByPk(id);

    if (!workingRule) {
      return res.status(404).json({
        success: false,
        message: 'Working rule not found'
      });
    }

    if (workingRule.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default working rule'
      });
    }

    await workingRule.destroy();

    res.json({
      success: true,
      message: 'Working rule deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting working rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete working rule',
      error: error.message
    });
  }
};

/**
 * Set working rule as default
 */
export const setDefaultWorkingRule = async (req, res) => {
  try {
    const { id } = req.params;
    const workingRule = await WorkingRule.findByPk(id);

    if (!workingRule) {
      return res.status(404).json({
        success: false,
        message: 'Working rule not found'
      });
    }

    if (!workingRule.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set inactive working rule as default'
      });
    }

    // This will automatically unset other defaults due to beforeSave hook
    await workingRule.update({
      isDefault: true,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Working rule set as default successfully',
      data: workingRule
    });
  } catch (error) {
    logger.error('Error setting default working rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default working rule',
      error: error.message
    });
  }
};

/**
 * Check if date is working day
 */
export const checkWorkingDay = async (req, res) => {
  try {
    const { date } = req.params;
    const checkDate = new Date(date);

    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const isWorking = await WorkingRule.isWorkingDay(checkDate);
    const isWeekend = await WorkingRule.isWeekend(checkDate);
    const activeRule = await WorkingRule.getActiveRule(checkDate);

    res.json({
      success: true,
      data: {
        date: checkDate.toISOString().split('T')[0],
        dayOfWeek: checkDate.getDay(),
        isWorkingDay: isWorking,
        isWeekend: isWeekend,
        activeRule: activeRule ? {
          id: activeRule.id,
          ruleName: activeRule.ruleName,
          workingDays: activeRule.workingDays,
          weekendDays: activeRule.weekendDays
        } : null
      }
    });
  } catch (error) {
    logger.error('Error checking working day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check working day',
      error: error.message
    });
  }
};