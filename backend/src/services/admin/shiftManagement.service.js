/**
 * Enhanced Shift Management Service
 * Handles shift changes with proper business logic for active attendance sessions
 */

import { Op } from 'sequelize';
import { EmployeeShift, Shift, Employee, AttendanceRecord } from '../../models/index.js';
import notificationService from '../notificationService.js';
import { auditLogger } from '../../utils/auditLogger.js';

class ShiftManagementService {
  /**
   * Update shift timing with proper business logic
   * @param {number} shiftId - Shift ID to update
   * @param {Object} updateData - New shift data
   * @param {number} updatedBy - User ID making the change
   * @returns {Object} Update result with affected employees
   */
  static async updateShiftTiming(shiftId, updateData, updatedBy) {
    try {
      const shift = await Shift.findByPk(shiftId);
      if (!shift) {
        throw new Error('Shift not found');
      }

      // Store original values for comparison
      const originalData = {
        shiftStartTime: shift.shiftStartTime,
        shiftEndTime: shift.shiftEndTime,
        shiftName: shift.shiftName
      };

      // Check if timing is actually changing
      const timingChanged = 
        originalData.shiftStartTime !== updateData.shiftStartTime ||
        originalData.shiftEndTime !== updateData.shiftEndTime;

      if (!timingChanged) {
        // No timing change, proceed with normal update
        await shift.update({ ...updateData, updatedBy });
        return {
          success: true,
          message: 'Shift updated successfully',
          timingChanged: false,
          affectedEmployees: []
        };
      }

      // Get employees currently assigned to this shift
      const affectedEmployees = await this.getEmployeesWithActiveShift(shiftId);
      
      // Check for employees with active attendance sessions today
      const employeesWithActiveSessions = await this.getEmployeesWithActiveAttendanceToday(
        affectedEmployees.map(emp => emp.id)
      );

      // Update the shift
      await shift.update({ ...updateData, updatedBy });

      // Handle notifications and effective date logic
      const result = await this.handleShiftChangeNotifications(
        shift,
        originalData,
        updateData,
        affectedEmployees,
        employeesWithActiveSessions,
        updatedBy
      );

      // Log the change
      await auditLogger.logAction({
        userId: updatedBy,
        action: 'shift_timing_update',
        module: 'shift_management',
        targetType: 'Shift',
        targetId: shiftId,
        oldValues: originalData,
        newValues: updateData,
        description: `Updated shift timing for "${shift.shiftName}". Affected ${affectedEmployees.length} employees.`,
        severity: 'medium',
        metadata: {
          affectedEmployeeCount: affectedEmployees.length,
          activeSessionCount: employeesWithActiveSessions.length,
          effectiveDate: result.effectiveDate
        }
      });

      return {
        success: true,
        message: result.message,
        timingChanged: true,
        affectedEmployees: affectedEmployees.length,
        activeSessionsToday: employeesWithActiveSessions.length,
        effectiveDate: result.effectiveDate,
        notifications: result.notifications
      };

    } catch (error) {
      console.error('Error updating shift timing:', error);
      throw error;
    }
  }

  /**
   * Get employees currently assigned to a shift
   */
  static async getEmployeesWithActiveShift(shiftId) {
    const today = new Date().toISOString().split('T')[0];
    
    return await Employee.findAll({
      include: [{
        model: EmployeeShift,
        as: 'shiftAssignments',
        where: {
          shiftId,
          isActive: true,
          effectiveDate: { [Op.lte]: today },
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: today } }
          ]
        },
        include: [{
          model: Shift,
          as: 'shift'
        }]
      }]
    });
  }

  /**
   * Get employees with active attendance sessions today
   */
  static async getEmployeesWithActiveAttendanceToday(employeeIds) {
    if (!employeeIds.length) return [];

    const today = new Date().toISOString().split('T')[0];
    
    const activeAttendance = await AttendanceRecord.findAll({
      where: {
        employeeId: { [Op.in]: employeeIds },
        date: today,
        status: { [Op.in]: ['in_progress', 'on_break', 'incomplete'] },
        clockIn: { [Op.not]: null }
      },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'employeeId']
      }]
    });

    return activeAttendance.map(record => record.employee);
  }

  /**
   * Handle notifications and determine effective date
   */
  static async handleShiftChangeNotifications(
    shift, 
    originalData, 
    newData, 
    affectedEmployees, 
    employeesWithActiveSessions,
    updatedBy
  ) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const hasActiveSessions = employeesWithActiveSessions.length > 0;
    const effectiveDate = hasActiveSessions ? 
      tomorrow.toISOString().split('T')[0] : 
      today.toISOString().split('T')[0];

    let message = '';
    let notifications = [];

    if (hasActiveSessions) {
      // Changes will take effect tomorrow
      message = `Shift timing updated successfully. Changes will take effect tomorrow (${effectiveDate}) as ${employeesWithActiveSessions.length} employees have active sessions today.`;
      
      // Notify employees with active sessions
      for (const employee of employeesWithActiveSessions) {
        if (employee.userId) {
          const notification = {
            title: '⏰ Shift Timing Changed - Effective Tomorrow',
            message: `Your shift "${shift.shiftName}" timing has been updated and will take effect tomorrow. New timing: ${newData.shiftStartTime} - ${newData.shiftEndTime}. Your current session continues with the original timing.`,
            type: 'info',
            category: 'shift',
            metadata: {
              shiftId: shift.id,
              shiftName: shift.shiftName,
              oldTiming: `${originalData.shiftStartTime} - ${originalData.shiftEndTime}`,
              newTiming: `${newData.shiftStartTime} - ${newData.shiftEndTime}`,
              effectiveDate,
              reason: 'active_session_protection'
            }
          };
          
          await notificationService.sendToUser(employee.userId, notification);
          notifications.push({
            employeeId: employee.id,
            type: 'active_session_protection',
            sent: true
          });
        }
      }

      // Notify other affected employees (not currently active)
      const inactiveEmployees = affectedEmployees.filter(emp => 
        !employeesWithActiveSessions.find(active => active.id === emp.id)
      );

      for (const employee of inactiveEmployees) {
        if (employee.userId) {
          const notification = {
            title: '⏰ Shift Timing Updated',
            message: `Your shift "${shift.shiftName}" timing has been updated. New timing: ${newData.shiftStartTime} - ${newData.shiftEndTime}. Changes are effective immediately.`,
            type: 'info',
            category: 'shift',
            metadata: {
              shiftId: shift.id,
              shiftName: shift.shiftName,
              oldTiming: `${originalData.shiftStartTime} - ${originalData.shiftEndTime}`,
              newTiming: `${newData.shiftStartTime} - ${newData.shiftEndTime}`,
              effectiveDate: today.toISOString().split('T')[0],
              reason: 'no_active_session'
            }
          };
          
          await notificationService.sendToUser(employee.userId, notification);
          notifications.push({
            employeeId: employee.id,
            type: 'immediate_effect',
            sent: true
          });
        }
      }

    } else {
      // No active sessions, changes take effect immediately
      message = `Shift timing updated successfully. Changes are effective immediately for all ${affectedEmployees.length} assigned employees.`;
      
      // Notify all affected employees
      for (const employee of affectedEmployees) {
        if (employee.userId) {
          const notification = {
            title: '⏰ Shift Timing Updated',
            message: `Your shift "${shift.shiftName}" timing has been updated. New timing: ${newData.shiftStartTime} - ${newData.shiftEndTime}. Changes are effective immediately.`,
            type: 'info',
            category: 'shift',
            metadata: {
              shiftId: shift.id,
              shiftName: shift.shiftName,
              oldTiming: `${originalData.shiftStartTime} - ${originalData.shiftEndTime}`,
              newTiming: `${newData.shiftStartTime} - ${newData.shiftEndTime}`,
              effectiveDate,
              reason: 'no_active_sessions'
            }
          };
          
          await notificationService.sendToUser(employee.userId, notification);
          notifications.push({
            employeeId: employee.id,
            type: 'immediate_effect',
            sent: true
          });
        }
      }
    }

    return {
      message,
      effectiveDate,
      notifications
    };
  }

  /**
   * Get shift change impact analysis
   */
  static async getShiftChangeImpact(shiftId) {
    try {
      const shift = await Shift.findByPk(shiftId);
      if (!shift) {
        throw new Error('Shift not found');
      }

      const affectedEmployees = await this.getEmployeesWithActiveShift(shiftId);
      const employeesWithActiveSessions = await this.getEmployeesWithActiveAttendanceToday(
        affectedEmployees.map(emp => emp.id)
      );

      return {
        shift: {
          id: shift.id,
          name: shift.shiftName,
          currentTiming: `${shift.shiftStartTime} - ${shift.shiftEndTime}`
        },
        impact: {
          totalAffectedEmployees: affectedEmployees.length,
          employeesWithActiveSessions: employeesWithActiveSessions.length,
          employeesWithoutActiveSessions: affectedEmployees.length - employeesWithActiveSessions.length
        },
        recommendation: employeesWithActiveSessions.length > 0 ? 
          'Changes will take effect tomorrow to protect active attendance sessions' :
          'Changes can take effect immediately as no employees are currently clocked in',
        affectedEmployees: affectedEmployees.map(emp => ({
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          employeeId: emp.employeeId,
          hasActiveSession: employeesWithActiveSessions.find(active => active.id === emp.id) ? true : false
        }))
      };

    } catch (error) {
      console.error('Error analyzing shift change impact:', error);
      throw error;
    }
  }
}

export default ShiftManagementService;