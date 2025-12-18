import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Lead = sequelize.define('Lead', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    leadId: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    source: {
      type: DataTypes.ENUM('website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'other'),
      allowNull: false,
      defaultValue: 'website'
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
      allowNull: false,
      defaultValue: 'new'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    estimatedValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    expectedCloseDate: {
      type: DataTypes.DATE,
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    customFields: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    lastContactDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextFollowUpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    }
  }, {
    tableName: 'leads',
    timestamps: true,
    indexes: [
      {
        fields: ['leadId']
      },
      {
        fields: ['email']
      },
      {
        fields: ['status']
      },
      {
        fields: ['assignedTo']
      },
      {
        fields: ['createdBy']
      },
      {
        fields: ['expectedCloseDate']
      }
    ]
  });

// Generate lead ID
Lead.beforeCreate(async (lead) => {
  if (!lead.leadId) {
    const count = await Lead.count();
    lead.leadId = `LEAD-${String(count + 1).padStart(6, '0')}`;
  }
});

export default Lead;