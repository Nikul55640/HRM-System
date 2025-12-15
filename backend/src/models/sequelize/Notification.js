import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Notification = sequelize.define('Notification', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'reminder'),
    defaultValue: 'info',
  },
  category: {
    type: DataTypes.ENUM('system', 'attendance', 'leave', 'payroll', 'announcement', 'task'),
    defaultValue: 'system',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  actionUrl: {
    type: DataTypes.STRING,
  },
  actionText: {
    type: DataTypes.STRING,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  expiresAt: {
    type: DataTypes.DATE,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['createdAt'] },
  ],
});

export default Notification;