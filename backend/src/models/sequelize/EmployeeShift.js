import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const EmployeeShift = sequelize.define('EmployeeShift', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  shiftId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shifts',
      key: 'id'
    }
  },
  effectiveDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date from which this shift assignment is effective'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date until which this shift assignment is valid (null = ongoing)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes about this shift assignment'
  }
}, {
  tableName: 'employee_shifts',
  timestamps: true,
  indexes: [
    {
      fields: ['employeeId']
    },
    {
      fields: ['shiftId']
    },
    {
      fields: ['effectiveDate']
    },
    {
      fields: ['isActive']
    },
    {
      unique: true,
      fields: ['employeeId', 'effectiveDate'],
      name: 'unique_employee_shift_date'
    }
  ]
});

// Validate date ranges
EmployeeShift.beforeSave(async (employeeShift) => {
  if (employeeShift.endDate && employeeShift.effectiveDate > employeeShift.endDate) {
    throw new Error('End date cannot be before effective date');
  }

  // Check for overlapping assignments for the same employee
  const whereClause = {
    employeeId: employeeShift.employeeId,
    isActive: true,
    id: { [sequelize.Sequelize.Op.ne]: employeeShift.id || 0 }
  };

  // Check for overlaps
  const overlapping = await EmployeeShift.findOne({
    where: {
      ...whereClause,
      [sequelize.Sequelize.Op.or]: [
        // New assignment starts during existing assignment
        {
          effectiveDate: { [sequelize.Sequelize.Op.lte]: employeeShift.effectiveDate },
          [sequelize.Sequelize.Op.or]: [
            { endDate: null },
            { endDate: { [sequelize.Sequelize.Op.gte]: employeeShift.effectiveDate } }
          ]
        },
        // New assignment ends during existing assignment
        employeeShift.endDate ? {
          effectiveDate: { [sequelize.Sequelize.Op.lte]: employeeShift.endDate },
          [sequelize.Sequelize.Op.or]: [
            { endDate: null },
            { endDate: { [sequelize.Sequelize.Op.gte]: employeeShift.endDate } }
          ]
        } : {},
        // Existing assignment is completely within new assignment
        employeeShift.endDate ? {
          effectiveDate: { [sequelize.Sequelize.Op.gte]: employeeShift.effectiveDate },
          endDate: { [sequelize.Sequelize.Op.lte]: employeeShift.endDate }
        } : {}
      ]
    }
  });

  if (overlapping) {
    throw new Error('Employee already has a shift assignment for this date range');
  }
});

export default EmployeeShift;