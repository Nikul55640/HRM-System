import { AuditLog } from '../models/sequelize/index.js';

/**
 * Audit Logger Utility
 * Provides methods to log system activities for compliance and security
 */

class AuditLogger {
    /**
     * Log an audit event
     * @param {Object} logData - The audit log data
     * @param {number} logData.userId - ID of the user performing the action
     * @param {string} logData.action - The action being performed
     * @param {string} logData.module - The module/feature being accessed
     * @param {string} logData.targetType - Type of entity being acted upon
     * @param {number} logData.targetId - ID of the entity being acted upon
     * @param {Object} logData.oldValues - Previous values (for updates)
     * @param {Object} logData.newValues - New values (for creates/updates)
     * @param {string} logData.ipAddress - IP address of the request
     * @param {string} logData.userAgent - User agent string
     * @param {string} logData.severity - Severity level (low, medium, high, critical)
     * @param {boolean} logData.success - Whether the action was successful
     * @param {string} logData.errorMessage - Error message if action failed
     */
    async log(logData) {
        try {
            const auditEntry = {
                userId: logData.userId,
                action: logData.action,
                module: logData.module,
                targetType: logData.targetType || null,
                targetId: logData.targetId || null,
                oldValues: logData.oldValues || null,
                newValues: logData.newValues || null,
                ipAddress: logData.ipAddress || null,
                userAgent: logData.userAgent || null,
                severity: logData.severity || 'low',
                success: logData.success !== false, // Default to true unless explicitly false
                errorMessage: logData.errorMessage || null,
                sessionId: logData.sessionId || null,
                timestamp: new Date()
            };

            await AuditLog.create(auditEntry);
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error to avoid breaking the main operation
        }
    }

    /**
     * Log authentication events
     */
    async logAuth(userId, action, success = true, ipAddress = null, userAgent = null, errorMessage = null) {
        await this.log({
            userId,
            action,
            module: 'authentication',
            severity: success ? 'low' : 'medium',
            success,
            errorMessage,
            ipAddress,
            userAgent
        });
    }

    /**
     * Log profile updates
     */
    async logProfileUpdate(userId, targetId, oldValues, newValues, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action: 'profile_update',
            module: 'profile',
            targetType: 'Employee',
            targetId,
            oldValues,
            newValues,
            severity: 'low',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log attendance events
     */
    async logAttendance(userId, action, targetId, newValues, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'attendance',
            targetType: 'AttendanceRecord',
            targetId,
            newValues,
            severity: 'low',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log leave events
     */
    async logLeave(userId, action, targetId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'leave',
            targetType: 'LeaveRequest',
            targetId,
            oldValues,
            newValues,
            severity: 'low',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log employee management events
     */
    async logEmployee(userId, action, targetId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'employee',
            targetType: 'Employee',
            targetId,
            oldValues,
            newValues,
            severity: action.includes('delete') ? 'high' : 'medium',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log lead management events
     */
    async logLead(userId, action, targetId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'lead',
            targetType: 'Lead',
            targetId,
            oldValues,
            newValues,
            severity: 'low',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log shift management events
     */
    async logShift(userId, action, targetId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'shift',
            targetType: 'Shift',
            targetId,
            oldValues,
            newValues,
            severity: 'low',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log calendar/event management
     */
    async logCalendar(userId, action, targetType, targetId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'calendar',
            targetType,
            targetId,
            oldValues,
            newValues,
            severity: 'low',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log system configuration changes
     */
    async logSystem(userId, action, targetType, targetId, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'system',
            targetType,
            targetId,
            oldValues,
            newValues,
            severity: 'high',
            ipAddress,
            userAgent
        });
    }

    /**
     * Log security events
     */
    async logSecurity(userId, action, severity = 'critical', errorMessage = null, ipAddress = null, userAgent = null) {
        await this.log({
            userId,
            action,
            module: 'security',
            severity,
            success: false,
            errorMessage,
            ipAddress,
            userAgent
        });
    }
}

// Export singleton instance
export const auditLogger = new AuditLogger();
export default auditLogger;