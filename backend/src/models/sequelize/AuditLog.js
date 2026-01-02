import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    action: {
        type: DataTypes.ENUM(
            'login',
            'logout',
            'profile_update',
            'password_change',
            'attendance_clock_in',
            'attendance_clock_out',
            'attendance_break_in',
            'attendance_break_out',
            'attendance_edit',
            'attendance_correction_request',
            'attendance_correction_approve',
            'attendance_correction_reject',
            'leave_apply',
            'leave_approve',
            'leave_reject',
            'leave_cancel',
            'leave_balance_assign',
            'leave_balance_adjust',
            'employee_create',
            'employee_update',
            'employee_delete',
            'employee_activate',
            'employee_deactivate',
            'role_change',
            'permission_change',
            'lead_create',
            'lead_update',
            'lead_assign',
            'shift_create',
            'shift_update',
            'shift_assign',
            'shift_change_request',
            'holiday_create',
            'holiday_update',
            'event_create',
            'event_update',
            'policy_update',
            'system_config_change',
            'unauthorized_access_attempt'
        ),
        allowNull: false,
    },
    module: {
        type: DataTypes.ENUM(
            'authentication',
            'profile',
            'attendance',
            'leave',
            'employee',
            'lead',
            'shift',
            'calendar',
            'system',
            'security'
        ),
        allowNull: false,
    },
    targetType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Type of entity being acted upon (User, Employee, Leave, etc.)'
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the entity being acted upon'
    },
    oldValues: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Previous values before the change'
    },
    newValues: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'New values after the change'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Human-readable description of the action'
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        defaultValue: 'low',
        comment: 'Severity level for security monitoring'
    },
    isSuccessful: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether the action was successful'
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Error message if action failed'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional context data'
    },
}, {
    tableName: 'audit_logs',
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['action'] },
        { fields: ['module'] },
        { fields: ['createdAt'] },
        { fields: ['severity'] },
        { fields: ['isSuccessful'] },
        { fields: ['targetType', 'targetId'] },
        { fields: ['ipAddress'] },
    ],
});

// Static methods for audit logging
AuditLog.logAction = async function (params) {
    const {
        userId,
        action,
        module,
        targetType = null,
        targetId = null,
        oldValues = null,
        newValues = null,
        description,
        ipAddress = null,
        userAgent = null,
        sessionId = null,
        severity = 'low',
        isSuccessful = true,
        errorMessage = null,
        metadata = null
    } = params;

    try {
        return await this.create({
            userId,
            action,
            module,
            targetType,
            targetId,
            oldValues,
            newValues,
            description,
            ipAddress,
            userAgent,
            sessionId,
            severity,
            isSuccessful,
            errorMessage,
            metadata
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error to avoid breaking the main operation
        return null;
    }
};

AuditLog.getFilteredLogs = async function (filters = {}) {
    const {
        userId,
        action,
        module,
        startDate,
        endDate,
        severity,
        isSuccessful,
        limit = 100,
        offset = 0
    } = filters;

    const whereClause = {};

    if (userId) whereClause.userId = userId;
    if (action) whereClause.action = action;
    if (module) whereClause.module = module;
    if (severity) whereClause.severity = severity;
    if (isSuccessful !== undefined) whereClause.isSuccessful = isSuccessful;

    if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[sequelize.Sequelize.Op.gte] = startDate;
        if (endDate) whereClause.createdAt[sequelize.Sequelize.Op.lte] = endDate;
    }

    return await this.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: sequelize.models.User,
                as: 'user',
                attributes: ['id', 'email', 'role']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
    });
};

AuditLog.getSuspiciousActivities = async function (timeframe = 24) {
    const startDate = new Date(Date.now() - timeframe * 60 * 60 * 1000);

    return await this.findAll({
        where: {
            createdAt: {
                [sequelize.Sequelize.Op.gte]: startDate
            },
            [sequelize.Sequelize.Op.or]: [
                { severity: 'high' },
                { severity: 'critical' },
                { isSuccessful: false },
                { action: 'unauthorized_access_attempt' }
            ]
        },
        include: [
            {
                model: sequelize.models.User,
                as: 'user',
                attributes: ['id', 'email', 'role']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

export default AuditLog;