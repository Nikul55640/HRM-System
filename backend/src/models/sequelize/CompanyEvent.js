import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const CompanyEvent = sequelize.define('CompanyEvent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  eventType: {
    type: DataTypes.ENUM(
      'meeting',
      'training',
      'company_event',
      'deadline',
      'announcement',
      'other'
    ),
    defaultValue: 'other',
    comment: 'Event type - NOTE: holidays are managed separately in Holiday model, birthdays/anniversaries are generated events'
  },
  blocksWorkingDay: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'If true, attendance is not required for this event (company offsite, mandatory training, emergency shutdown)'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isAllDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  organizer: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  attendees: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurrenceRule: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'scheduled',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3498db',
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  reminders: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
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
  tableName: 'company_events',
  timestamps: true,
  indexes: [
    {
      fields: ['startDate'],
    },
    {
      fields: ['endDate'],
    },
    {
      fields: ['eventType'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['isPublic'],
    },
  ],
});

// Instance methods
CompanyEvent.prototype.isAccessibleBy = function(user) {
  // Public events are accessible to all
  if (this.isPublic) {
    return true;
  }
  
  // Creator can access
  if (this.createdBy === user.id) {
    return true;
  }
  
  // Organizer can access
  if (this.organizer === user.id) {
    return true;
  }
  
  // Attendees can access
  if (this.attendees && this.attendees.includes(user.id)) {
    return true;
  }
  
  // HR and Admin can access all events
  if (['SuperAdmin', 'HR Administrator', 'HR Manager'].includes(user.role)) {
    return true;
  }
  
  return false;
};

// Static methods
CompanyEvent.getUpcomingEvents = async function(limit = 10) {
  return await this.findAll({
    where: {
      startDate: {
        [sequelize.Sequelize.Op.gte]: new Date(),
      },
      status: 'scheduled',
      isPublic: true,
    },
    order: [['startDate', 'ASC']],
    limit,
  });
};

CompanyEvent.getEventsByDateRange = async function(startDate, endDate, userId = null) {
  const where = {
    [sequelize.Sequelize.Op.or]: [
      {
        startDate: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
      },
      {
        endDate: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
      },
      {
        [sequelize.Sequelize.Op.and]: [
          { startDate: { [sequelize.Sequelize.Op.lte]: startDate } },
          { endDate: { [sequelize.Sequelize.Op.gte]: endDate } },
        ],
      },
    ],
  };

  if (userId) {
    where[sequelize.Sequelize.Op.and] = [
      where,
      {
        [sequelize.Sequelize.Op.or]: [
          { isPublic: true },
          { createdBy: userId },
          { organizer: userId },
          sequelize.literal(`JSON_CONTAINS(attendees, '${userId}')`),
        ],
      },
    ];
  } else {
    where.isPublic = true;
  }

  return await this.findAll({
    where,
    order: [['startDate', 'ASC']],
  });
};

export default CompanyEvent;