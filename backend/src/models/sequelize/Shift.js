import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Shift = sequelize.define('Shift', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shiftName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  shiftCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  shiftStartTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Shift start time (HH:MM:SS)'
  },
  shiftEndTime: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Shift end time (HH:MM:SS)'
  },
  fullDayHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 8.00,
    comment: 'Minimum hours for full day attendance'
  },
  halfDayHours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 4.00,
    comment: 'Minimum hours for half day attendance'
  },
  gracePeriodMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Grace period for late arrival (minutes)'
  },
  lateThresholdMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15,
    comment: 'Minutes after grace period to mark as late'
  },
  earlyDepartureThresholdMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 15,
    comment: 'Minutes before shift end to mark as early departure'
  },
  defaultBreakMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    comment: 'Default break duration (minutes)'
  },
  maxBreakMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 120,
    comment: 'Maximum allowed break duration (minutes)'
  },
  overtimeEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether overtime tracking is enabled'
  },
  overtimeThresholdMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Minutes after shift end to start overtime calculation'
  },
  weeklyOffDays: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [0, 6], // Sunday and Saturday
    comment: 'Array of week days (0=Sunday, 6=Saturday) that are off days'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this is the default shift for new employees'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'shifts',
  timestamps: true,
  indexes: [
    {
      fields: ['shiftCode']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isDefault']
    }
  ]
});

// Generate shift code before creation
Shift.beforeCreate(async (shift) => {
  if (!shift.shiftCode) {
    const count = await Shift.count();
    shift.shiftCode = `SHIFT-${String(count + 1).padStart(3, '0')}`;
  }
});

// Ensure only one default shift
Shift.beforeSave(async (shift) => {
  if (shift.isDefault && shift.changed('isDefault')) {
    // Remove default flag from other shifts
    await Shift.update(
      { isDefault: false },
      { 
        where: { 
          isDefault: true,
          id: { [sequelize.Sequelize.Op.ne]: shift.id }
        }
      }
    );
  }
});

export default Shift;