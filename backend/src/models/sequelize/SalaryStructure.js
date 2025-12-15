import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const SalaryStructure = sequelize.define('SalaryStructure', {
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
  effectiveDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  basicSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  hra: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  allowances: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  deductions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  grossSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  netSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  payFrequency: {
    type: DataTypes.ENUM('monthly', 'bi-weekly', 'weekly'),
    defaultValue: 'monthly',
  },
  overtimeRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1.5,
  },
  bonusEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
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
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'salary_structures',
  timestamps: true,
  indexes: [
    { fields: ['employeeId'] },
    { fields: ['effectiveDate'] },
    { fields: ['status'] },
  ],
});

// Instance methods
SalaryStructure.prototype.calculateGross = function() {
  let gross = parseFloat(this.basicSalary) + parseFloat(this.hra || 0);
  
  if (this.allowances && Array.isArray(this.allowances)) {
    gross += this.allowances.reduce((sum, allowance) => sum + parseFloat(allowance.amount || 0), 0);
  }
  
  return gross;
};

SalaryStructure.prototype.calculateNet = function() {
  let net = this.calculateGross();
  
  if (this.deductions && Array.isArray(this.deductions)) {
    net -= this.deductions.reduce((sum, deduction) => sum + parseFloat(deduction.amount || 0), 0);
  }
  
  return net;
};

// Static methods
SalaryStructure.findByEmployee = function(employeeId) {
  return this.findAll({
    where: { employeeId },
    order: [['effectiveDate', 'DESC']],
  });
};

SalaryStructure.findCurrentByEmployee = function(employeeId) {
  return this.findOne({
    where: {
      employeeId,
      status: 'active',
      effectiveDate: {
        [sequelize.Sequelize.Op.lte]: new Date(),
      },
    },
    order: [['effectiveDate', 'DESC']],
  });
};

export default SalaryStructure;