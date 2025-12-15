import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const EmployeeProfile = sequelize.define('EmployeeProfile', {
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
  profilePicture: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  certifications: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  education: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  workExperience: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  languages: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  isPublic: {
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
  tableName: 'employee_profiles',
  timestamps: true,
});

export default EmployeeProfile;