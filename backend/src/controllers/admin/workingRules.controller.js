import { WorkingRule } from '../../models/index.js';
import logger from '../../utils/logger.js';
import notificationService from '../../services/notificationService.js';
import { formatDays, validateWorkingDays } from '../../utils/dayUtils.js';
import { NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES, SYSTEM_ROLES } from '../../constants/notifications.js';
import isEqual from 'lodash/isEqual.js';

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

    // Validate working days
    if (!validateWorkingDays(workingDays)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid working days. Must be array of numbers 0-6 (0=Sunday, 6=Saturday)'
      });
    }

    // Validate weekend days
    if (!validateWorkingDays(weekendDays)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid weekend days. Must be array of numbers 0-6 (0=Sunday, 6=Saturday)'
      });
    }

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

    // 🔔 NOTIFICATION TRIGGER POINT 1: Working Rule Created
    try {
      const workingDaysText = formatDays(workingDays);
      const weekendDaysText = formatDays(weekendDays);

      await notificationService.sendToRoles([SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.HR], {
        title: '📋 New Working Rule Created',
        message: `Working rule "${ruleName}" has been created. Working days: ${workingDaysText}. Weekends: ${weekendDaysText}. Effective from: ${effectiveFrom}`,
        type: NOTIFICATION_TYPES.INFO,
        category: NOTIFICATION_CATEGORIES.WORKING_RULES,
        metadata: {
          workingRuleId: workingRule.id,
          ruleName: workingRule.ruleName,
          workingDays: workingRule.workingDays,
          weekendDays: workingRule.weekendDays,
          effectiveFrom: workingRule.effectiveFrom,
          createdBy: req.user.firstName + ' ' + req.user.lastName,
          action: 'created'
        }
      });

      logger.info(`Working rule created notification sent for rule: ${ruleName}`);
    } catch (notificationError) {
      logger.error('Failed to send working rule creation notification:', notificationError);
      // Don't fail the main operation if notification fails
    }

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

    // Validate working days if provided
    if (workingDays && !validateWorkingDays(workingDays)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid working days. Must be array of numbers 0-6 (0=Sunday, 6=Saturday)'
      });
    }

    // Validate weekend days if provided
    if (weekendDays && !validateWorkingDays(weekendDays)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid weekend days. Must be array of numbers 0-6 (0=Sunday, 6=Saturday)'
      });
    }

    const workingRule = await WorkingRule.findByPk(id);

    if (!workingRule) {
      return res.status(404).json({
        success: false,
        message: 'Working rule not found'
      });
    }

    // Store old values for comparison
    const oldValues = {
      ruleName: workingRule.ruleName,
      workingDays: workingRule.workingDays,
      weekendDays: workingRule.weekendDays,
      isActive: workingRule.isActive,
      isDefault: workingRule.isDefault
    };

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

    // 🔔 NOTIFICATION TRIGGER POINT 2: Working Rule Updated
    try {
      const changes = [];
      
      if (!isEqual(oldValues.workingDays, workingDays)) {
        const newWorkingDaysText = formatDays(workingDays);
        changes.push(`Working days changed to: ${newWorkingDaysText}`);
      }

      if (!isEqual(oldValues.weekendDays, weekendDays)) {
        const newWeekendDaysText = formatDays(weekendDays);
        changes.push(`Weekend days changed to: ${newWeekendDaysText}`);
      }

      if (oldValues.isActive !== isActive) {
        changes.push(`Status changed to: ${isActive ? 'Active' : 'Inactive'}`);
      }

      if (oldValues.ruleName !== ruleName) {
        changes.push(`Name changed to: ${ruleName}`);
      }

      if (changes.length > 0) {
        const changeText = changes.join('. ');
        
        // Determine notification priority based on what changed
        const isHighPriority = oldValues.isActive || isActive || oldValues.isDefault || isDefault;
        const notificationType = isHighPriority ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.INFO;
        const titlePrefix = isHighPriority ? '⚠️ CRITICAL:' : '📝';

        await notificationService.sendToRoles([SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.HR], {
          title: `${titlePrefix} Working Rule Updated`,
          message: `Working rule "${ruleName}" has been updated. ${changeText}`,
          type: notificationType,
          category: NOTIFICATION_CATEGORIES.WORKING_RULES,
          metadata: {
            workingRuleId: workingRule.id,
            ruleName: workingRule.ruleName,
            changes: changes,
            oldValues: oldValues,
            newValues: {
              workingDays,
              weekendDays,
              isActive,
              isDefault
            },
            updatedBy: req.user.firstName + ' ' + req.user.lastName,
            action: 'updated',
            isHighPriority
          }
        });

        // If this affects payroll/attendance (active rule changes), notify payroll team too
        if (isHighPriority) {
          logger.warn(`CRITICAL: Active working rule updated - may affect attendance calculations`);
        }

        logger.info(`Working rule updated notification sent for rule: ${ruleName}`);
      }
    } catch (notificationError) {
      logger.error('Failed to send working rule update notification:', notificationError);
      // Don't fail the main operation if notification fails
    }

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

    // Store rule details for notification before deletion
    const ruleDetails = {
      id: workingRule.id,
      ruleName: workingRule.ruleName,
      workingDays: workingRule.workingDays,
      weekendDays: workingRule.weekendDays,
      isActive: workingRule.isActive
    };

    await workingRule.destroy();

    // 🔔 NOTIFICATION TRIGGER POINT 4: Working Rule Deleted (Optional)
    try {
      const workingDaysText = formatDays(ruleDetails.workingDays);

      // Only notify if it was an active rule (more important)
      if (ruleDetails.isActive) {
        await notificationService.sendToRoles([SYSTEM_ROLES.SUPER_ADMIN], {
          title: '🗑️ Active Working Rule Deleted',
          message: `Active working rule "${ruleDetails.ruleName}" has been deleted. Working days were: ${workingDaysText}`,
          type: NOTIFICATION_TYPES.WARNING,
          category: NOTIFICATION_CATEGORIES.WORKING_RULES,
          metadata: {
            deletedRuleId: ruleDetails.id,
            ruleName: ruleDetails.ruleName,
            workingDays: ruleDetails.workingDays,
            weekendDays: ruleDetails.weekendDays,
            deletedBy: req.user.firstName + ' ' + req.user.lastName,
            action: 'deleted'
          }
        });
      } else {
        // For inactive rules, just notify admins
        await notificationService.sendToRoles([SYSTEM_ROLES.SUPER_ADMIN], {
          title: '🗑️ Working Rule Deleted',
          message: `Working rule "${ruleDetails.ruleName}" has been deleted`,
          type: NOTIFICATION_TYPES.INFO,
          category: NOTIFICATION_CATEGORIES.WORKING_RULES,
          metadata: {
            deletedRuleId: ruleDetails.id,
            ruleName: ruleDetails.ruleName,
            deletedBy: req.user.firstName + ' ' + req.user.lastName,
            action: 'deleted'
          }
        });
      }

      logger.info(`Working rule deletion notification sent for rule: ${ruleDetails.ruleName}`);
    } catch (notificationError) {
      logger.error('Failed to send working rule deletion notification:', notificationError);
      // Don't fail the main operation if notification fails
    }

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

    // Get the old default rule for notification
    const oldDefaultRule = await WorkingRule.findOne({
      where: { isDefault: true }
    });

    // This will automatically unset other defaults due to beforeSave hook
    await workingRule.update({
      isDefault: true,
      updatedBy: req.user.id
    });

    // 🔔 NOTIFICATION TRIGGER POINT 3: Default Working Rule Changed (HIGHEST PRIORITY)
    try {
      const workingDaysText = formatDays(workingRule.workingDays);
      const weekendDaysText = formatDays(workingRule.weekendDays);

      await notificationService.sendToRoles([SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.HR], {
        title: '🚨 CRITICAL: Default Working Rule Changed',
        message: `"${workingRule.ruleName}" is now the default working rule. This affects all attendance calculations and payroll processing. Working days: ${workingDaysText}. Weekends: ${weekendDaysText}.`,
        type: NOTIFICATION_TYPES.ERROR, // Use error type for highest visibility
        category: NOTIFICATION_CATEGORIES.WORKING_RULES,
        metadata: {
          workingRuleId: workingRule.id,
          ruleName: workingRule.ruleName,
          workingDays: workingRule.workingDays,
          weekendDays: workingRule.weekendDays,
          effectiveFrom: workingRule.effectiveFrom,
          oldDefaultRule: oldDefaultRule ? {
            id: oldDefaultRule.id,
            name: oldDefaultRule.ruleName
          } : null,
          updatedBy: req.user.firstName + ' ' + req.user.lastName,
          action: 'set_default',
          priority: 'CRITICAL',
          systemImpact: 'attendance_payroll'
        }
      });

      logger.warn(`CRITICAL: Default working rule changed to "${workingRule.ruleName}" by ${req.user.firstName} ${req.user.lastName}`);
    } catch (notificationError) {
      logger.error('Failed to send default working rule notification:', notificationError);
      // Don't fail the main operation if notification fails
    }

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