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
  // Personal Information
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  address: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Contains street, city, state, country, zipCode'
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Job Information (Read-only for employees)
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  employmentType: {
    type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
    defaultValue: 'full_time',
  },
  reportingManager: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id',
    },
  },

  // Bank Details
  bankDetails: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Contains accountHolderName, bankName, accountNumber, ifscCode, isVerified'
  },

  // Emergency Contact
  emergencyContact: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Contains name, relationship, phone, email'
  },

  // Status
  status: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Terminated'),
    defaultValue: 'Active',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  tableName: 'employees',
  timestamps: true,
  indexes: [
    { fields: ['employeeId'], unique: true },
    { fields: ['email'], unique: true },
    { fields: ['status'] },
    { fields: ['department'] },
    { fields: ['reportingManager'] },
  ],
});

// Instance methods
Employee.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

Employee.prototype.toPublicJSON = function () {
  const values = { ...this.get() };
  // Remove sensitive bank details for public view
  if (values.bankDetails) {
    values.bankDetails = {
      ...values.bankDetails,
      accountNumber: values.bankDetails.accountNumber ? '****' + values.bankDetails.accountNumber.slice(-4) : null
    };
  }
  return values;
};

export default Employee;