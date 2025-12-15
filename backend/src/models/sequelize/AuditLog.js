import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT'),
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'critical'),
    defaultValue: 'info',
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entityDisplayName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  userRole: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  performedByName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  performedByEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'audit_logs',
  timestamps: false,
  indexes: [
    {
      fields: ['action'],
    },
    {
      fields: ['entityType'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['timestamp'],
    },
    {
      fields: ['severity'],
    },
  ],
});

// Static method for logging actions
AuditLog.logAction = async function(logData) {
  try {
    const {
      action,
      severity = 'info',
      entityType,
      entityId,
      entityDisplayName,
      userId,
      userRole,
      performedByName,
      performedByEmail,
      description,
      changes,
      meta,
      ipAddress,
      userAgent,
    } = logData;

    await this.create({
      action,
      severity,
      entityType,
      entityId,
      entityDisplayName,
      userId,
      userRole,
      performedByName,
      performedByEmail,
      description,
      changes,
      meta,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging audit action:', error);
    // Don't throw error to prevent breaking the main operation
  }
};

export default AuditLog;