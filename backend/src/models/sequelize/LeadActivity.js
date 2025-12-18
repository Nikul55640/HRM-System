import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const LeadActivity = sequelize.define('LeadActivity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'leads',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('call', 'email', 'meeting', 'task', 'note', 'status_change', 'assignment_change'),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    outcome: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nextAction: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'lead_activities',
    timestamps: true,
    indexes: [
      {
        fields: ['leadId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['scheduledDate']
      },
      {
        fields: ['assignedTo']
      },
      {
        fields: ['createdBy']
      }
    ]
  });

export default LeadActivity;