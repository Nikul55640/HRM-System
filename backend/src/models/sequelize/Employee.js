import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  personalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  contactInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  jobInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  emergencyContact: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  documentsList: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Terminated', 'On Leave'),
    defaultValue: 'Active',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
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
  tableName: 'employees',
  timestamps: true,
});

export default Employee;