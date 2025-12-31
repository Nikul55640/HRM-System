import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    unique: true,
    comment: 'Short department code (e.g., IT, HR, FIN)'
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
    comment: 'Department head/manager'
  },
  parentDepartmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
    comment: 'For hierarchical department structure'
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  costCenter: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  employeeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of employees in this department'
  },
  // Audit fields
  createdBy: {
    type: DataTypes.INTEGER,
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
  tableName: 'departments',
  timestamps: true,
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['code'], unique: true },
    { fields: ['managerId'] },
    { fields: ['parentDepartmentId'] },
    { fields: ['isActive'] },
  ],
});

// Instance methods
Department.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

export default Department;