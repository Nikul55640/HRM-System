import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
  },
  // For one-time holidays
  date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
    },
    comment: 'Full date for one-time holidays (YYYY-MM-DD)'
  },
  // For recurring holidays
  recurringDate: {
    type: DataTypes.STRING(5),
    allowNull: true,
    validate: {
      is: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    },
    comment: 'MM-DD format for recurring holidays (e.g., "08-15" for Independence Day)'
  },
  type: {
    type: DataTypes.ENUM('ONE_TIME', 'RECURRING'),
    allowNull: false,
    defaultValue: 'ONE_TIME',
    comment: 'Holiday type: ONE_TIME for specific year, RECURRING for every year'
  },
  category: {
    type: DataTypes.ENUM('public', 'optional', 'national', 'religious', 'company'),
    allowNull: false,
    defaultValue: 'public',
    comment: 'Holiday category for classification'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  appliesEveryYear: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this holiday applies every year (for recurring holidays)'
  },
  color: {
    type: DataTypes.STRING(7), // Hex color code
    allowNull: true,
    defaultValue: '#dc2626', // Red color for holidays
    validate: {
      is: /^#[0-9A-F]{6}$/i, // Hex color validation
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  hrApprovalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'approved',
    comment: 'HR approval status for holiday visibility and payroll inclusion'
  },
  visibleToEmployees: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this holiday is visible to employees in calendar'
  },
  includeInPayroll: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this holiday should be included in payroll calculations'
  },
  locationScope: {
    type: DataTypes.ENUM('GLOBAL', 'STATE', 'CITY'),
    allowNull: false,
    defaultValue: 'GLOBAL',
    comment: 'Geographic scope of the holiday (useful for India state-specific holidays)'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  // Calendarific integration fields
  calendarificData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'calendarific_data',
    comment: 'Original Calendarific API data for reference'
  },
  calendarificUuid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'calendarific_uuid',
    comment: 'Calendarific holiday UUID for tracking updates'
  },
  syncedFromCalendarific: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'synced_from_calendarific',
    comment: 'Whether this holiday was synced from Calendarific API'
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_synced_at',
    comment: 'Last time this holiday was synced from Calendarific'
  },
}, {
  tableName: 'holidays',
  timestamps: true,
  indexes: [
    {
      fields: ['date'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

// Instance methods
Holiday.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

// Static methods
Holiday.getHolidaysInRange = async function(startDate, endDate, filters = {}) {
  const whereClause = {
    isActive: true,
    ...filters,
  };

  // For one-time holidays, check date range
  const oneTimeHolidays = await this.findAll({
    where: {
      ...whereClause,
      type: 'ONE_TIME',
      date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate],
      }
    },
    order: [['date', 'ASC']],
  });

  // For recurring holidays, generate dates for the range
  const recurringHolidays = await this.findAll({
    where: {
      ...whereClause,
      type: 'RECURRING',
      appliesEveryYear: true
    }
  });

  const generatedRecurringHolidays = [];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  for (const holiday of recurringHolidays) {
    for (let year = startYear; year <= endYear; year++) {
      const [month, day] = holiday.recurringDate.split('-');
      const holidayDate = new Date(year, parseInt(month) - 1, parseInt(day));
      
      if (holidayDate >= startDate && holidayDate <= endDate) {
        generatedRecurringHolidays.push({
          ...holiday.toJSON(),
          date: holidayDate.toISOString().split('T')[0], // YYYY-MM-DD format
          id: `${holiday.id}_${year}`, // Unique ID for each year
          isGenerated: true
        });
      }
    }
  }

  return [...oneTimeHolidays, ...generatedRecurringHolidays].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
};

Holiday.getUpcomingHolidays = async function(limit = 5) {
  const today = new Date();
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  
  const holidays = await this.getHolidaysInRange(today, endOfYear);
  return holidays.slice(0, limit);
};

Holiday.isHoliday = async function(date) {
  const checkDate = new Date(date);
  const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
  
  const holidays = await this.getHolidaysInRange(startOfDay, endOfDay);
  return holidays.length > 0;
};

Holiday.getHolidayForDate = async function(date) {
  const checkDate = new Date(date);
  const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));
  
  const holidays = await this.getHolidaysInRange(startOfDay, endOfDay);
  return holidays.length > 0 ? holidays[0] : null;
};

// Validation hooks
Holiday.beforeSave(async (holiday) => {
  // Validate that either date or recurringDate is provided, but not both
  if (holiday.type === 'ONE_TIME') {
    if (!holiday.date) {
      throw new Error('One-time holidays must have a date');
    }
    if (holiday.recurringDate) {
      throw new Error('One-time holidays cannot have a recurring date');
    }
    holiday.appliesEveryYear = false;
  } else if (holiday.type === 'RECURRING') {
    if (!holiday.recurringDate) {
      throw new Error('Recurring holidays must have a recurring date in MM-DD format');
    }
    if (holiday.date) {
      throw new Error('Recurring holidays cannot have a specific date');
    }
    holiday.appliesEveryYear = true;
  }
});

export default Holiday;