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
     * @param {string} logData.description - Human-readable description of the action
     * @param {string} logData.targetType - Type of entity being acted upon
     * @param {number} logData.targetId - ID of the entity being acted upon
     * @param {Object} logData.oldValues - Previous values (for updates)
     * @param {Object} logData.newValues - New values (for creates/updates)
     * @param {string} logData.ipAddress - IP address of the request
     * @param {string} logData.userAgent - User agent string
     * @param {string} logData.severity - Severity level (low, medium, high, critical)
     * @param {boolean} logData.isSuccessful - Whether the action was successful
     * @param {string} logData.errorMessage - Error message if action failed
     * @param {Object} logData.metadata - Additional context data
     */
    async log(logData) {
        try {
            const auditEntry = {
                userId: logData.userId,
                action: logData.action,
                module: logData.module,
                description: logData.description || `${logData.action} performed on ${logData.module}`,
                targetType: logData.targetType || null,
                targetId: logData.targetId || null,
                oldValues: logData.oldValues || null,
                newValues: logData.newValues || null,
                ipAddress: logData.ipAddress || null,
                userAgent: logData.userAgent || null,
                severity: logData.severity || 'low',
                isSuccessful: logData.isSuccessful !== false, // Default to true unless explicitly false
                errorMessage: logData.errorMessage || null,
                sessionId: logData.sessionId || null,
                metadata: logData.metadata || null
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
            description: `User authentication: ${action}${success ? ' successful' : ' failed'}`,
            severity: success ? 'low' : 'medium',
            isSuccessful: success,
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
            description: `Profile updated for user ID ${targetId}`,
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
            description: `Attendance ${action} recorded`,
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
            description: `Leave request ${action}`,
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
            description: `Employee ${action} performed`,
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
            description: `Lead ${action} performed`,
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
            description: `Shift ${action} performed`,
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
            description: `Calendar ${action} performed on ${targetType}`,
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
            description: `System configuration ${action} performed`,
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
            description: `Security event: ${action}`,
            severity,
            isSuccessful: false,
            errorMessage,
            ipAddress,
            userAgent
        });
    }
}

// Export singleton instance
export const auditLogger = new AuditLogger();
export default auditLogger;