import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const LeadNote = sequelize.define('LeadNote', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('general', 'call_log', 'meeting_notes', 'follow_up', 'important'),
      allowNull: false,
      defaultValue: 'general'
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'lead_notes',
    timestamps: true,
    indexes: [
      {
        fields: ['leadId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

export default LeadNote;