import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const WorkingRule = sequelize.define('WorkingRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ruleName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Human-readable name for the working rule'
  },
  workingDays: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [1, 2, 3, 4, 5], // Mon-Fri
    comment: 'Array of working days (0=Sunday, 1=Monday, ..., 6=Saturday)'
  },
  weekendDays: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [0, 6], // Sunday & Saturday
    comment: 'Array of weekend days (0=Sunday, 1=Monday, ..., 6=Saturday)'
  },
  effectiveFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date from which this rule is effective'
  },
  effectiveTo: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date until which this rule is valid (null = ongoing)'
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
    comment: 'Whether this is the default working rule'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of this working rule'
  },
  shiftType: {
    type: DataTypes.ENUM('GENERAL', 'SHIFT'),
    allowNull: false,
    defaultValue: 'GENERAL',
    comment: 'Type of working rule - GENERAL for standard office hours, SHIFT for shift-based work'
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
  tableName: 'working_rules',
  timestamps: true,
  indexes: [
    { fields: ['effectiveFrom'] },
    { fields: ['effectiveTo'] },
    { fields: ['isActive'] },
    { fields: ['isDefault'] }
  ]
});

// Instance methods
WorkingRule.prototype.isWorkingDay = function(dayOfWeek) {
  return this.workingDays.includes(dayOfWeek);
};

WorkingRule.prototype.isWeekend = function(dayOfWeek) {
  return this.weekendDays.includes(dayOfWeek);
};

WorkingRule.prototype.isValidForDate = function(date) {
  const checkDate = new Date(date);
  const effectiveFrom = new Date(this.effectiveFrom);
  const effectiveTo = this.effectiveTo ? new Date(this.effectiveTo) : null;
  
  return checkDate >= effectiveFrom && (!effectiveTo || checkDate <= effectiveTo);
};

// Static methods
WorkingRule.getActiveRule = async function(date = new Date()) {
  const rule = await this.findOne({
    where: {
      isActive: true,
      effectiveFrom: { [sequelize.Sequelize.Op.lte]: date },
      [sequelize.Sequelize.Op.or]: [
        { effectiveTo: null },
        { effectiveTo: { [sequelize.Sequelize.Op.gte]: date } }
      ]
    },
    order: [['effectiveFrom', 'DESC']]
  });

  return rule;
};

WorkingRule.getDefaultRule = async function() {
  return await this.findOne({
    where: {
      isDefault: true,
      isActive: true
    }
  });
};

WorkingRule.isWorkingDay = async function(date) {
  const rule = await this.getActiveRule(date);
  if (!rule) return true; // Default to working day if no rule found
  
  const dayOfWeek = new Date(date).getDay();
  return rule.isWorkingDay(dayOfWeek);
};

WorkingRule.isWeekend = async function(date) {
  const rule = await this.getActiveRule(date);
  if (!rule) return [0, 6].includes(new Date(date).getDay()); // Default weekends
  
  const dayOfWeek = new Date(date).getDay();
  return rule.isWeekend(dayOfWeek);
};

WorkingRule.isWeekendByDayIndex = async function(dayOfWeek) {
  const rule = await this.getActiveRule(new Date());
  if (!rule) return [0, 6].includes(dayOfWeek); // Default weekends
  
  return rule.isWeekend(dayOfWeek);
};

// Validation hooks
WorkingRule.beforeSave(async (workingRule) => {
  // Validate working days and weekend days don't overlap
  const workingSet = new Set(workingRule.workingDays);
  const weekendSet = new Set(workingRule.weekendDays);
  const intersection = [...workingSet].filter(day => weekendSet.has(day));
  
  if (intersection.length > 0) {
    throw new Error('Working days and weekend days cannot overlap');
  }
  
  // Validate all days are covered
  const allDays = new Set([...workingRule.workingDays, ...workingRule.weekendDays]);
  if (allDays.size !== 7) {
    throw new Error('All 7 days of the week must be assigned as either working or weekend days');
  }
  
  // Validate date range
  if (workingRule.effectiveTo && workingRule.effectiveFrom > workingRule.effectiveTo) {
    throw new Error('Effective from date cannot be after effective to date');
  }
  
  // If setting as default, unset other defaults
  if (workingRule.isDefault && workingRule.isActive) {
    await WorkingRule.update(
      { isDefault: false },
      { 
        where: { 
          isDefault: true,
          id: { [sequelize.Sequelize.Op.ne]: workingRule.id || 0 }
        }
      }
    );
  }
});

export default WorkingRule;