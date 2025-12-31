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
  designationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'designations',
      key: 'id',
    },
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Deprecated: Use designationId instead'
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    },
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Deprecated: Use departmentId instead'
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  employmentType: {
    type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'),
    defaultValue: 'full_time',
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
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
    { fields: ['designationId'] },
    { fields: ['departmentId'] },
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

// Transform to frontend expected structure
Employee.prototype.toFrontendJSON = function () {
  const values = this.get();
  return {
    id: values.id,
    employeeId: values.employeeId,
    personalInfo: {
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      profilePhoto: values.profilePicture
    },
    contactInfo: {
      email: values.email,
      phone: values.phone,
      address: values.address
    },
    jobInfo: {
      designation: values.designation,
      department: values.department,
      joiningDate: values.joiningDate,
      employmentType: values.employmentType,
      reportingManager: values.reportingManager
    },
    bankDetails: values.bankDetails,
    emergencyContact: values.emergencyContact,
    status: values.status,
    isActive: values.isActive,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

export default Employee;