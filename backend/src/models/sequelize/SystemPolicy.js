import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const SystemPolicy = sequelize.define('SystemPolicy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    policyType: {
        type: DataTypes.ENUM(
            'attendance',
            'leave',
            'shift',
            'security',
            'general'
        ),
        allowNull: false,
    },
    policyKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Unique identifier for the policy setting'
    },
    policyName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Human-readable name of the policy'
    },
    policyValue: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Policy configuration values'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description of what this policy controls'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    tableName: 'system_policies',
    timestamps: true,
    indexes: [
        { fields: ['policyType'] },
        { fields: ['policyKey'], unique: true },
        { fields: ['isActive'] },
    ],
});

// Static methods for policy management
SystemPolicy.getPolicy = async function (policyKey) {
    const policy = await this.findOne({
        where: {
            policyKey,
            isActive: true
        }
    });

    return policy ? policy.policyValue : null;
};

SystemPolicy.setPolicy = async function (policyKey, policyValue, userId) {
    const [policy, created] = await this.findOrCreate({
        where: { policyKey },
        defaults: {
            policyType: this.inferPolicyType(policyKey),
            policyKey,
            policyName: this.generatePolicyName(policyKey),
            policyValue,
            createdBy: userId,
            isActive: true
        }
    });

    if (!created) {
        const oldValue = policy.policyValue;
        policy.policyValue = policyValue;
        policy.updatedBy = userId;
        await policy.save();

        // Log the policy change
        const { AuditLog } = await import('./index.js');
        await AuditLog.logAction({
            userId,
            action: 'policy_update',
            module: 'system',
            targetType: 'SystemPolicy',
            targetId: policy.id,
            oldValues: { policyValue: oldValue },
            newValues: { policyValue },
            description: `Updated policy: ${policy.policyName}`,
            severity: 'medium'
        });
    }

    return policy;
};

SystemPolicy.getPoliciesByType = async function (policyType) {
    return await this.findAll({
        where: {
            policyType,
            isActive: true
        },
        order: [['policyName', 'ASC']]
    });
};

// Helper methods
SystemPolicy.inferPolicyType = function (policyKey) {
    if (policyKey.includes('attendance')) return 'attendance';
    if (policyKey.includes('leave')) return 'leave';
    if (policyKey.includes('shift')) return 'shift';
    if (policyKey.includes('security')) return 'security';
    return 'general';
};

SystemPolicy.generatePolicyName = function (policyKey) {
    return policyKey
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Default policies that should be created on system initialization
SystemPolicy.getDefaultPolicies = function () {
    return [
        {
            policyKey: 'attendance_grace_period_minutes',
            policyType: 'attendance',
            policyName: 'Attendance Grace Period (Minutes)',
            policyValue: { value: 10, unit: 'minutes' },
            description: 'Grace period for late clock-in before marking as late'
        },
        {
            policyKey: 'attendance_late_threshold_minutes',
            policyType: 'attendance',
            policyName: 'Late Threshold (Minutes)',
            policyValue: { value: 15, unit: 'minutes' },
            description: 'Minutes after grace period to mark as late'
        },
        {
            policyKey: 'attendance_max_break_minutes',
            policyType: 'attendance',
            policyName: 'Maximum Break Duration (Minutes)',
            policyValue: { value: 120, unit: 'minutes' },
            description: 'Maximum allowed break duration per day'
        },
        {
            policyKey: 'leave_annual_quota',
            policyType: 'leave',
            policyName: 'Annual Leave Quota',
            policyValue: { casual: 12, sick: 12, paid: 21 },
            description: 'Default annual leave quotas for new employees'
        },
        {
            policyKey: 'leave_advance_notice_days',
            policyType: 'leave',
            policyName: 'Leave Advance Notice (Days)',
            policyValue: { casual: 1, sick: 0, paid: 7 },
            description: 'Required advance notice for different leave types'
        },
        {
            policyKey: 'leave_cancellation_allowed',
            policyType: 'leave',
            policyName: 'Leave Cancellation Policy',
            policyValue: {
                allowCancellation: true,
                cutoffHours: 24,
                refundPolicy: 'full'
            },
            description: 'Policy for leave cancellation and balance refund'
        },
        {
            policyKey: 'security_session_timeout_minutes',
            policyType: 'security',
            policyName: 'Session Timeout (Minutes)',
            policyValue: { value: 480, unit: 'minutes' },
            description: 'User session timeout duration'
        },
        {
            policyKey: 'security_password_policy',
            policyType: 'security',
            policyName: 'Password Policy',
            policyValue: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                expiryDays: 90
            },
            description: 'Password complexity and expiry requirements'
        }
    ];
};

export default SystemPolicy;