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
    allowNull: true
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

  // Follow-up and Notes (simplified)
  followUpNotes: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of follow-up notes with timestamp and content'
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
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    },
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'leads',
  timestamps: true,
  indexes: [
    { fields: ['leadId'] },
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['assignedTo'] },
    { fields: ['createdBy'] },
    { fields: ['expectedCloseDate'] }
  ]
});

// Instance methods
Lead.prototype.addFollowUpNote = function (note, userId) {
  const followUpNotes = this.followUpNotes || [];
  followUpNotes.push({
    id: Date.now(),
    note,
    createdBy: userId,
    createdAt: new Date(),
  });
  this.followUpNotes = followUpNotes;
  this.updatedBy = userId;
  return this.save();
};

Lead.prototype.updateStatus = function (status, userId) {
  this.status = status;
  this.updatedBy = userId;
  this.lastContactDate = new Date();
  return this.save();
};

// Generate lead ID
Lead.beforeCreate(async (lead) => {
  if (!lead.leadId) {
    try {
      const count = await Lead.count({ where: { isActive: true } });
      lead.leadId = `LEAD-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      const timestamp = Date.now().toString().slice(-6);
      lead.leadId = `LEAD-${timestamp}`;
    }
  }
});

export default Lead;