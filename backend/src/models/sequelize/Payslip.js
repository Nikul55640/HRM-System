import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Payslip = sequelize.define('Payslip', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id',
    },
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2000,
      max: 2100,
    },
  },
  earnings: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      basic: 0,
      hra: 0,
      allowances: [],
      bonus: 0,
      overtime: 0,
      total: 0,
    },
  },
  deductions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      tax: 0,
      providentFund: 0,
      insurance: 0,
      loan: 0,
      other: [],
      total: 0,
    },
  },
  netPay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  pdfUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'draft',
  },
  generatedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'payslips',
  timestamps: true,
  indexes: [
    { fields: ['employeeId', 'year', 'month'], unique: true },
    { fields: ['employeeId'] },
    { fields: ['status'] },
    { fields: ['year', 'month'] },
  ],
});

// Virtual for month name
Payslip.prototype.getMonthName = function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[this.month - 1];
};

// Virtual for period
Payslip.prototype.getPeriod = function() {
  return `${this.getMonthName()} ${this.year}`;
};

// Instance method
Payslip.prototype.isPublished = function() {
  return this.status === 'published';
};

// Static methods
Payslip.findByEmployee = function(employeeId) {
  return this.findAll({
    where: { employeeId },
    order: [['year', 'DESC'], ['month', 'DESC']],
  });
};

Payslip.findByYear = function(employeeId, year) {
  return this.findAll({
    where: { employeeId, year },
    order: [['month', 'DESC']],
  });
};

export default Payslip;